use crate::model::Tournament;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CreateTournament<'info> {
    #[account(mut)]
    pub host: Signer<'info>,
    #[account(init, payer = host, space = 8 + Tournament::INIT_SPACE, seeds = [b"tournaments", host.key().as_ref()], bump)]
    pub tournament: Account<'info, Tournament>,
    pub system_program: Program<'info, System>,
}
