use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount};

pub trait Prefixable {
    const PREFIX: &'static [u8];
}

impl Prefixable for Mint {
    const PREFIX: &'static [u8] = b"mint";
}

impl Prefixable for TokenAccount {
    const PREFIX: &'static [u8] = b"token";
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone, InitSpace)]
pub struct Participant {
    pub token: Pubkey,
    pub stake: u64,
    pub delay: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Contest {
    #[max_len(8)]
    pub participants: Vec<Participant>,
    #[max_len(16)]
    pub name: String,
    pub bump: u8,
}

impl Prefixable for Contest {
    const PREFIX: &'static [u8] = b"contest";
}

#[account]
#[derive(InitSpace)]
pub struct Casino {
    /// The creator of the casino who initially stakes.
    pub authority: Pubkey,
    /// The configured token to be exchanged in this casino.
    pub mint: Pubkey,
    /// Human-readable name of the casino.
    #[max_len(8)]
    pub name: String,
    /// Bump from the initialized program-level casino.
    pub casino_bump: u8,
    /// Bump from the initialized program-level token account.
    pub token_bump: u8,
}

impl Prefixable for Casino {
    const PREFIX: &'static [u8] = b"casino";
}
