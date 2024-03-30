use crate::model::Prefixable as _;
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

#[derive(Accounts)]
pub struct CreateMint<'info> {
    #[account(mut)]
    pub wallet: Signer<'info>,
    #[account(
        init,
        payer = wallet,
        seeds = [Mint::PREFIX, wallet.key().as_ref()],
        bump,
        mint::decimals = 0,
        mint::authority = wallet,
        mint::freeze_authority = wallet,
    )]
    pub mint: Account<'info, Mint>,
    #[account(
        init,
        payer = wallet,
        associated_token::mint = mint,
        associated_token::authority = wallet,
    )]
    pub token: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}
