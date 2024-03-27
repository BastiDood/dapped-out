use crate::model::{Contest, Prefixable};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

#[derive(Accounts)]
#[instruction(slug: String)]
pub struct JoinContest<'info> {
    pub wallet: Signer<'info>,
    pub admin: AccountInfo<'info>,
    pub mint: Account<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = wallet,
    )]
    pub src: Account<'info, TokenAccount>,
    #[account(
        mut,
        address = contest.participants[0].token.key(),
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
    pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum JoinError {
    #[msg("too many participants")]
    TooMany,
    #[msg("participant already exists")]
    AlreadyExists,
}
