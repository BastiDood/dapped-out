mod inst;
mod model;

use anchor_lang::prelude::*;
use inst::*;
use model::*;

declare_id!("89si6S2bCwct7sqLE5ihvrJPtV3jYuE6HBa4Q2MoATtM");

#[program]
mod dapped_out {
    use super::*;

    pub fn create_casino(ctx: Context<CreateCasino>, name: String) -> Result<()> {
        let Context { accounts: CreateCasino { wallet, mint, casino, .. }, bumps, .. } = ctx;
        casino.authority = wallet.key();
        casino.mint = mint.key();
        casino.name = name;
        casino.casino_bump = bumps.casino;
        casino.token_bump = bumps.token;
        Ok(())
    }

    pub fn create_contest(ctx: Context<CreateContest>, name: String, stake: u64, delay: u64) -> Result<()> {
        let Context { accounts: CreateContest { wallet, mint, contest, src, dst, token_program, .. }, bumps, .. } = ctx;

        // Initialize the contest data
        contest.name = name;
        contest.bump = bumps.contest;
        contest.participants.clear();
        contest.participants.push(Participant { token: src.key(), stake, delay });

        // Transfer the stake to the casino
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
}
