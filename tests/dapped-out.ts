import { AnchorProvider, type Program, utils, web3, workspace } from '@coral-xyz/anchor';
import { BN } from 'bn.js';
import { DappedOut } from '../target/types/dapped_out';
import { expect } from 'chai';

describe('dapped-out', () => {
    const provider = AnchorProvider.env();
    const program: Program<DappedOut> = workspace.DappedOut;

    const [contestAddress, contestBump] = web3.PublicKey.findProgramAddressSync(
        [utils.bytes.utf8.encode('contest'), provider.publicKey.toBuffer()],
        program.programId,
    );

    it('should create a new contest', async () => {
        // TODO: Test Balance
        await program.methods
            .createContest('Hello world!', new BN(10), new BN(1000))
            .accounts({
                contest: contestAddress,
                wallet: provider.publicKey,
                systemProgram: web3.SystemProgram.programId,
            })
            .rpc();

        const { name, bump, participants: [first, ...rest] } = await program.account.contest.fetch(contestAddress);
        expect(name).eq('Hello world!');
        expect(bump).eq(contestBump);

        expect(first?.authority.equals(provider.publicKey)).true;
        expect(first?.stake.eq(new BN(10))).true;
        expect(first?.delay.eq(new BN(1000))).true;
        expect(rest).empty;
    });

    const dummy = web3.Keypair.generate();
    it('should join an existing contest', async () => {
        // TODO: Test Balance
        await program.methods
            .joinContest(new BN(0), new BN(995))
            .accounts({
                contest: contestAddress,
                wallet: dummy.publicKey,
                author: provider.publicKey,
            })
            .signers([dummy])
            .rpc();

        const { name, bump, participants: [first, second, ...rest] } = await program.account.contest.fetch(contestAddress);
        expect(name).eq('Hello world!');
        expect(bump).eq(contestBump);

        expect(first?.authority.equals(provider.publicKey)).true;
        expect(first?.stake.eq(new BN(10))).true;
        expect(first?.delay.eq(new BN(1000))).true;

        expect(second?.authority.equals(dummy.publicKey)).true;
        expect(second?.stake.eq(new BN(0))).true;
        expect(second?.delay.eq(new BN(995))).true;

        expect(rest).empty;
        // TODO: Assert balance
    });

    it('should close an existing contest', async () => {
        // TODO: Test Balance
        await program.methods
            .closeContest()
            .accounts({
                contest: contestAddress,
                wallet: provider.publicKey,
                systemProgram: web3.SystemProgram.programId,
            })
            .rpc();

        const info = await program.account.contest.getAccountInfo(contestAddress);
        expect(info).null;

        // TODO: Assert balance
    });
});
