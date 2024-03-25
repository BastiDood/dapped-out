import { AnchorProvider, type Program, getProvider, setProvider, utils, web3, workspace } from '@coral-xyz/anchor';
import { BN } from 'bn.js';
import { DappedOut } from '../target/types/dapped_out';
import { expect } from 'chai';

describe('dapped-out', () => {
    // Configure the client to use the local cluster.
    setProvider(AnchorProvider.env());
    const provider = getProvider();
    const program: Program<DappedOut> = workspace.DappedOut;

    it('should be initialized', async () => {
        const [tournament, _] = web3.PublicKey.findProgramAddressSync(
            [utils.bytes.utf8.encode('tournaments'), provider.publicKey.toBuffer()],
            program.programId,
        );

        await program.methods
            .createTournament('Hello world!', new BN(10), new BN(1000), 8)
            .accounts({ tournament, host: provider.publicKey, systemProgram: web3.SystemProgram.programId })
            .rpc();

        const { name, limit, participants: [{ user, stake, delay }, ...rest] } = await program.account.tournament.fetch(tournament);

        expect(name).eq('Hello world!');
        expect(limit).eq(8);

        expect(user.equals(provider.publicKey)).true;
        expect(stake.toNumber()).eq(10);
        expect(delay.toNumber()).eq(1000);
        expect(rest).length(0);
    });
});
