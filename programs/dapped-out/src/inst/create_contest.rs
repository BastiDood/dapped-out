use crate::model::{Contest, Prefixable};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

#[derive(Accounts)]
#[instruction(slug: String)]
pub struct CreateContest<'info> {
    #[account(mut)]
    pub wallet: Signer<'info>,
    pub mint: Account<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = wallet,
    )]
    pub src: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = wallet,
        seeds = [TokenAccount::PREFIX, wallet.key().as_ref(), slug.as_bytes()],
        bump,
        token::mint = mint,
        token::authority = wallet,
    )]
    pub dst: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = wallet,
        space = 8 + Contest::INIT_SPACE,
        seeds = [Contest::PREFIX, wallet.key().as_ref(), slug.as_bytes()],
        bump,
    )]
    pub contest: Account<'info, Contest>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}
