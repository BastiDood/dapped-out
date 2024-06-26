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
pub struct LiveParticipant {
    pub token: Pubkey,
    pub delay: i64,
}

#[account]
#[derive(InitSpace)]
pub struct Contest {
    /// Wallet of the host/author of the contest.
    pub host: Pubkey,
    /// Unique slug provided by the contest initiator.
    #[max_len(16)]
    pub slug: String,
    /// The configured token to be exchanged in this casino.
    pub mint: Pubkey,
    /// List of participants. The first one is always the authority.
    #[max_len(8)]
    pub participants: Vec<LiveParticipant>,
    /// Human-readable contest name.
    #[max_len(16)]
    pub name: String,
    /// The "entrance fee" of the contest.
    pub stake: u64,
    /// The "expected reaction time" estimated as an offset from the first participant's delay.
    pub offset: f64,
    /// Bump for the contest account (used for validation).
    pub contest_bump: u8,
    /// Bump for the token account (used for validation).
    pub token_bump: u8,
}

impl Prefixable for Contest {
    const PREFIX: &'static [u8] = b"contest";
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone, InitSpace)]
pub struct DoneParticipant {
    pub token: Pubkey,
    pub delay: i64,
    pub reward: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Archive {
    /// Unique slug provided by the contest initiator.
    #[max_len(16)]
    pub slug: String,
    /// The configured token to be exchanged in this casino.
    pub mint: Pubkey,
    /// Token address of the contest host.
    pub token: Pubkey,
    /// The "entrance fee" of the contest.
    pub stake: u64,
    /// The host-assigned delay.
    pub delay: i64,
    /// The "expected reaction time" estimated as an offset from the first participant's delay.
    pub offset: f64,
    /// List of participants. The first one is always the authority.
    #[max_len(8)]
    pub winnings: Vec<DoneParticipant>,
    /// Human-readable contest name.
    #[max_len(16)]
    pub name: String,
    /// Bump for the contest account (used for validation).
    pub bump: u8,
}

impl Prefixable for Archive {
    const PREFIX: &'static [u8] = b"archive";
}
