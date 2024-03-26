mod inst;
mod model;

use anchor_lang::prelude::*;
use inst::*;
use model::Participant;

declare_id!("89si6S2bCwct7sqLE5ihvrJPtV3jYuE6HBa4Q2MoATtM");

#[program]
mod dapped_out {
    use super::*;

    pub fn create_contest(ctx: Context<CreateContest>, name: String, stake: u64, delay: i64) -> Result<()> {
        let Context { accounts: CreateContest { wallet, contest, system_program }, bumps, .. } = ctx;

        // Initialize tournament details
        contest.name = name;
        contest.bump = bumps.contest;

        // Initialize first participant
        contest.participants.push(Participant { authority: wallet.key(), stake, delay });

        // Stake the coins into the contest
        use anchor_lang::system_program::{transfer, Transfer};
        let args = Transfer { from: wallet.to_account_info(), to: contest.to_account_info() };
        let cpi = CpiContext::new(system_program.to_account_info(), args);
        transfer(cpi, stake)
    }

    pub fn join_contest(ctx: Context<JoinContest>, stake: u64, delay: i64) -> Result<()> {
        let Context { accounts: JoinContest { wallet, contest, system_program, .. }, .. } = ctx;

        // Add the user to the participants
        contest.participants.push(Participant { authority: wallet.key(), stake, delay });

        // Stake the coins into the contest
        use anchor_lang::system_program::{transfer, Transfer};
        let args = Transfer { from: wallet.to_account_info(), to: contest.to_account_info() };
        let cpi = CpiContext::new(system_program.to_account_info(), args);
        transfer(cpi, stake)
    }

    pub fn close_contest(_ctx: Context<CloseContest>) -> Result<()> {
        Ok(())
    }
}
