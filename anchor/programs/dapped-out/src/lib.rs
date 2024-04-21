mod inst;
mod model;
mod wald;

use anchor_lang::prelude::*;
use inst::*;
use model::*;

declare_id!("GQKYmPzoZuj2LHDATr8LSBrrncT2pXDMjyaoP8AaP3XJ");

#[program]
mod dapped_out {
    use super::*;

    pub fn create_mint(_ctx: Context<CreateMint>) -> Result<()> {
        Ok(())
    }

    pub fn transfer_tokens(ctx: Context<TransferTokens>, amount: u64) -> Result<()> {
        use anchor_spl::token::{transfer_checked, TransferChecked};
        let Context { accounts: TransferTokens { mint, wallet, src, dst, token_program, .. }, .. } = ctx;
        let args = TransferChecked {
            mint: mint.to_account_info(),
            authority: wallet.to_account_info(),
            from: src.to_account_info(),
            to: dst.to_account_info(),
        };
        let cpi = CpiContext::new(token_program.to_account_info(), args);
        transfer_checked(cpi, amount, mint.decimals)
    }

    pub fn create_contest(
        ctx: Context<CreateContest>,
        slug: String,
        name: String,
        stake: u64,
        delay: i64,
        offset: f64,
    ) -> Result<()> {
        let Context { accounts: CreateContest { wallet, mint, contest, src, dst, token_program, .. }, bumps, .. } = ctx;

        // Initialize the contest data
        contest.host = wallet.key();
        contest.slug = slug;
        contest.name = name;
        contest.stake = stake;
        contest.offset = offset;
        contest.mint = mint.key();
        contest.contest_bump = bumps.contest;
        contest.token_bump = bumps.dst;

        // Ensure that the first participant is always the creator
        contest.participants.clear();
        contest.participants.push(LiveParticipant { token: src.key(), delay });

        // Transfer the stake to the contest token account
        use anchor_spl::token::{transfer_checked, TransferChecked};
        let accounts = TransferChecked {
            mint: mint.to_account_info(),
            from: src.to_account_info(),
            to: dst.to_account_info(),
            authority: wallet.to_account_info(),
        };
        let cpi = CpiContext::new(token_program.to_account_info(), accounts);
        transfer_checked(cpi, stake, mint.decimals)
    }

    pub fn join_contest(ctx: Context<JoinContest>, _slug: String, delay: i64) -> Result<()> {
        let Context { accounts: JoinContest { wallet, mint, contest, src, dst, token_program, .. }, .. } = ctx;

        // Add a new participant to the contest
        contest.participants.push(LiveParticipant { token: src.key(), delay });

        // Transfer the stake to the contest token account
        use anchor_spl::token::{transfer_checked, TransferChecked};
        let args = TransferChecked {
            mint: mint.to_account_info(),
            from: src.to_account_info(),
            to: dst.to_account_info(),
            authority: wallet.to_account_info(),
        };
        let cpi = CpiContext::new(token_program.to_account_info(), args);
        transfer_checked(cpi, contest.stake, mint.decimals)
    }

    pub fn close_contest<'info>(ctx: Context<'_, '_, '_, 'info, CloseContest<'info>>, _slug: String) -> Result<()> {
        use anchor_spl::token::{close_account, transfer_checked, CloseAccount, TransferChecked};
        let Context {
            accounts: CloseContest { wallet, mint, token, contest, archive, token_program, .. },
            bumps,
            remaining_accounts,
            ..
        } = ctx;

        let Ok(len) = u64::try_from(contest.participants.len()) else {
            return Err(CloseError::TooLarge.into());
        };
        let Ok(pot) = u32::try_from(len * contest.stake) else {
            return Err(CloseError::TooLarge.into());
        };

        // Treat the first participant as the "mode" of the Wald distribution
        let mut iter = contest.participants.iter().zip(remaining_accounts);
        let (host_participant, host_account) = iter.next().ok_or(CloseError::MissingAuthority)?;
        let Ok(mode) = u32::try_from(host_participant.delay) else {
            return Err(CloseError::TooLarge.into());
        };

        let wald = wald::Wald::new(mode.into(), contest.offset);
        let contestants: Vec<_> = iter
            .map(|(&LiveParticipant { token, delay }, account)| {
                require_keys_eq!(token, account.key(), CloseError::AccountMismatch);
                let Ok(int_delay) = u32::try_from(delay) else {
                    return Err(CloseError::TooLarge.into());
                };
                Ok((account, delay, wald.sample(int_delay.into())))
            })
            .collect::<Result<_>>()?;

        // Normalize the weights of the contests
        let total = contestants.iter().map(|&(_, _, wald)| wald).sum::<f64>();
        let winnings: Vec<_> = contestants
            .into_iter()
            .map(|(account, delay, sample)| {
                // Check if the reward can be casted to an integer
                let reward = sample / total * f64::from(pot);
                require!(reward.is_finite(), CloseError::BadTransfer);
                require_gt!(reward, 0., CloseError::BadTransfer);
                require!(reward <= f64::from(u32::MAX), CloseError::BadTransfer);
                let reward = unsafe { reward.to_int_unchecked() };
                let args = TransferChecked {
                    mint: mint.to_account_info(),
                    authority: wallet.to_account_info(),
                    from: token.to_account_info(),
                    to: account.clone(),
                };
                let cpi = CpiContext::new(token_program.to_account_info(), args);
                transfer_checked(cpi, reward, mint.decimals)?;
                Ok(DoneParticipant { token: account.key(), delay, reward })
            })
            .collect::<Result<_>>()?;

        // Move the residual to the host
        token.reload()?;
        let args = TransferChecked {
            mint: mint.to_account_info(),
            authority: wallet.to_account_info(),
            from: token.to_account_info(),
            to: host_account.clone(),
        };
        let cpi = CpiContext::new(token_program.to_account_info(), args);
        transfer_checked(cpi, token.amount, mint.decimals)?;

        // Then finally close the token account
        let args = CloseAccount {
            account: token.to_account_info(),
            authority: wallet.to_account_info(),
            destination: wallet.to_account_info(),
        };
        let cpi = CpiContext::new(token_program.to_account_info(), args);
        close_account(cpi)?;

        // Move the contest to the archive
        use core::mem::take;
        archive.mint = contest.mint.key();
        archive.token = host_participant.token;
        archive.stake = contest.stake;
        archive.delay = host_participant.delay;
        archive.offset = contest.offset;
        archive.bump = bumps.archive;
        archive.winnings = winnings;
        archive.slug = take(&mut contest.slug);
        archive.name = take(&mut contest.name);

        Ok(())
    }
}
