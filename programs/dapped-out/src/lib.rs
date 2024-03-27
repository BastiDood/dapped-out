mod inst;
mod model;

use anchor_lang::prelude::*;
use inst::*;
use model::*;

declare_id!("89si6S2bCwct7sqLE5ihvrJPtV3jYuE6HBa4Q2MoATtM");

#[program]
mod dapped_out {
    use super::*;

    pub fn create_contest(
        ctx: Context<CreateContest>,
        slug: String,
        name: String,
        stake: u64,
        delay: u64,
    ) -> Result<()> {
        let Context { accounts: CreateContest { wallet, mint, contest, src, dst, token_program, .. }, bumps, .. } = ctx;

        // Initialize the contest data
        contest.slug = slug;
        contest.name = name;
        contest.mint = mint.key();
        contest.contest_bump = bumps.contest;
        contest.token_bump = bumps.dst;

        // Ensure that the first participant is always the creator
        contest.participants.clear();
        contest.participants.push(Participant { token: src.key(), stake, delay });

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
}
