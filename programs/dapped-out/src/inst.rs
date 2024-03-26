use crate::model::{Contest, Participant};
use anchor_lang::prelude::*;

const CONTEST_PREFIX: &'static [u8] = b"contest";

#[derive(Accounts)]
pub struct CreateContest<'info> {
    #[account(mut)]
    pub wallet: Signer<'info>,
    #[account(
        init,
        payer = wallet,
        space = 8 + Contest::INIT_SPACE,
        seeds = [CONTEST_PREFIX, wallet.key().as_ref()],
        bump,
    )]
    pub contest: Account<'info, Contest>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinContest<'info> {
    #[account(mut)]
    pub wallet: Signer<'info>,
    /// CHECK: We only care about the public key.
    pub author: UncheckedAccount<'info>,
    #[account(
        mut,
        constraint = contest.participants.len() < 8 @ JoinError::TooMany,
        constraint = !contest.participants.iter().any(|&Participant { authority, .. }| authority == wallet.key()) @ JoinError::AlreadyExists,
        constraint = contest.participants[0].authority == author.key() @ JoinError::InvalidAuthority,
        seeds = [CONTEST_PREFIX, author.key().as_ref()],
        bump = contest.bump,
    )]
    pub contest: Account<'info, Contest>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum JoinError {
    #[msg("too many participants")]
    TooMany,
    #[msg("invalid authority")]
    InvalidAuthority,
    #[msg("participant already exists")]
    AlreadyExists,
}

#[derive(Accounts)]
pub struct CloseContest<'info> {
    #[account(mut)]
    pub wallet: Signer<'info>,
    #[account(
        mut,
        constraint = contest.participants[0].authority == wallet.key() @ CloseError::InvalidAuthority,
        seeds = [CONTEST_PREFIX, wallet.key().as_ref()],
        bump = contest.bump,
        close = wallet,
    )]
    pub contest: Account<'info, Contest>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum CloseError {
    #[msg("invalid authority")]
    InvalidAuthority,
}
