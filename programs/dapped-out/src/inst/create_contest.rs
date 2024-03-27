use crate::model::{Casino, Contest, Prefixable};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct CreateContest<'info> {
    #[account(mut)]
    pub wallet: Signer<'info>,
    pub admin: AccountInfo<'info>,
    #[account(
        seeds = [Casino::PREFIX, admin.key().as_ref()],
        bump = casino.casino_bump,
    )]
    pub casino: Account<'info, Casino>,
    #[account(address = casino.mint)]
    pub mint: Account<'info, Mint>,
    #[account(associated_token::mint = mint, associated_token::authority = wallet)]
    pub src: Account<'info, TokenAccount>,
    #[account(
        seeds = [TokenAccount::PREFIX, admin.key().as_ref(), mint.key().as_ref()],
        bump = casino.token_bump,
        token::mint = mint,
        token::authority = admin,
    )]
    pub dst: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = wallet,
        space = 8 + Contest::INIT_SPACE,
        seeds = [Contest::PREFIX, admin.key().as_ref(), wallet.key().as_ref()],
        bump,
    )]
    pub contest: Account<'info, Contest>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}
