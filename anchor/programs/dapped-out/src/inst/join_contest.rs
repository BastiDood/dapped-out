use crate::model::{Contest, Prefixable as _};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

#[derive(Accounts)]
#[instruction(slug: String)]
pub struct JoinContest<'info> {
    #[account(mut)]
    pub wallet: Signer<'info>,
    /// CHECK: Only used for validation of passed accounts.
    pub admin: AccountInfo<'info>,
    #[account(address = contest.mint)]
    pub mint: Account<'info, Mint>,
    #[account(
        init_if_needed,
        payer = wallet,
        associated_token::mint = mint,
        associated_token::authority = wallet,
    )]
    pub src: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [TokenAccount::PREFIX, admin.key().as_ref(), slug.as_bytes()],
        bump = contest.token_bump,
        token::mint = mint,
        token::authority = admin,
    )]
    pub dst: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = contest.participants.len() < 8 @ JoinError::TooMany,
        constraint = !contest.participants.iter().any(|p| p.token == src.key()) @ JoinError::AlreadyExists,
        seeds = [Contest::PREFIX, admin.key().as_ref(), slug.as_bytes()],
        bump = contest.contest_bump,
    )]
    pub contest: Account<'info, Contest>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[error_code]
pub enum JoinError {
    #[msg("too many participants")]
    TooMany,
    #[msg("participant already exists")]
    AlreadyExists,
}
