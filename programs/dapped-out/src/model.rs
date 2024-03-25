use anchor_lang::prelude::*;

#[derive(AnchorDeserialize, AnchorSerialize, Clone, InitSpace)]
pub struct Participant {
    pub user: Pubkey,
    pub stake: u64,
    pub delay: i64,
}

#[account]
#[derive(InitSpace)]
pub struct Tournament {
    #[max_len(16)]
    pub name: String,
    #[max_len(8)]
    pub participants: Vec<Participant>,
    pub limit: u8,
    pub bump: u8,
}
