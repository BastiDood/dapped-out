mod context;
mod model;

use anchor_lang::prelude::*;
use context::*;
use model::Participant;

declare_id!("89si6S2bCwct7sqLE5ihvrJPtV3jYuE6HBa4Q2MoATtM");

#[program]
mod dapped_out {
    use super::*;

    pub fn create_tournament(
        ctx: Context<CreateTournament>,
        name: String,
        stake: u64,
        delay: i64,
        limit: u8,
    ) -> Result<()> {
        // Initialize tournament details
        let Context {
            accounts: CreateTournament {
                tournament, host, ..
            },
            bumps,
            ..
        } = ctx;
        tournament.name = name;
        tournament.limit = limit;
        tournament.bump = bumps.tournament;

        // Initialize first participant
        let user = host.key();
        tournament
            .participants
            .push(Participant { user, stake, delay });

        Ok(())
    }
}
