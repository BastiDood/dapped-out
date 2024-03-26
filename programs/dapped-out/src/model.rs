use anchor_lang::prelude::*;

#[derive(AnchorDeserialize, AnchorSerialize, Clone, InitSpace)]
pub struct Participant {
    pub authority: Pubkey,
    pub stake: u64,
    pub delay: i64,
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
