use crate::model::{Casino, Prefixable};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

#[derive(Accounts)]
pub struct CreateCasino<'info> {
    #[account(mut)]
    pub wallet: Signer<'info>,
    pub mint: Account<'info, Mint>,
    #[account(
        init,
        payer = wallet,
        space = 8 + Casino::INIT_SPACE,
        seeds = [Casino::PREFIX, wallet.key().as_ref()],
        bump,
    )]
    pub casino: Account<'info, Casino>,
    #[account(
        init,
        payer = wallet,
        seeds = [TokenAccount::PREFIX, wallet.key().as_ref(), mint.key().as_ref()],
        bump,
        token::mint = mint,
        token::authority = wallet,
    )]
    pub token: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}
