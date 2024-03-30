use crate::model::{Archive, Contest, Prefixable as _};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

#[derive(Accounts)]
#[instruction(slug: String)]
pub struct CloseContest<'info> {
    #[account(mut)]
    pub wallet: Signer<'info>,
    #[account(address = contest.mint)]
    pub mint: Account<'info, Mint>,
    #[account(
        mut,
        seeds = [TokenAccount::PREFIX, wallet.key().as_ref(), slug.as_bytes()],
        bump = contest.token_bump,
        token::mint = mint,
        token::authority = wallet,
    )]
    pub token: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [Contest::PREFIX, wallet.key().as_ref(), slug.as_bytes()],
        bump = contest.contest_bump,
        close = wallet,
    )]
    pub contest: Account<'info, Contest>,
    #[account(
        init,
        payer = wallet,
        space = 8 + Archive::INIT_SPACE,
        seeds = [Archive::PREFIX, wallet.key().as_ref(), slug.as_bytes()],
        bump,
    )]
    pub archive: Account<'info, Archive>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum CloseError {
    #[msg("first contest participant is missing")]
    MissingAuthority,
    #[msg("an integer was too large")]
    TooLarge,
    #[msg("provided accounts mismatched on participants")]
    AccountMismatch,
    #[msg("cannot convert reward to integer")]
    BadTransfer,
}
