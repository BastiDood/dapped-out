import { AnchorProvider, BN, type Program, utils, web3, workspace } from '@coral-xyz/anchor';
import { createAssociatedTokenAccountInstruction, createMintToCheckedInstruction } from '@solana/spl-token';
import { describe, expect, it } from 'vitest';
import type { DappedOut } from '../target/types/dapped_out';

describe('dapped-out', () => {
    const provider = AnchorProvider.env();
    const program: Program<DappedOut> = workspace.DappedOut;
    const seeds = [provider.publicKey.toBytes(), utils.bytes.utf8.encode('test')];

    const [contestAddress, _contestBump] = web3.PublicKey.findProgramAddressSync(
        [utils.bytes.utf8.encode('contest'), ...seeds],
        program.programId,
    );

    const [archiveAddress, _archiveBump] = web3.PublicKey.findProgramAddressSync(
        [utils.bytes.utf8.encode('archive'), ...seeds],
        program.programId,
    );

    const [programTokenAccountAddress, _tokenAccountBump] = web3.PublicKey.findProgramAddressSync(
        [utils.bytes.utf8.encode('token'), ...seeds],
        program.programId,
    );

    const [mintAddress, _mintBump] = web3.PublicKey.findProgramAddressSync(
        [utils.bytes.utf8.encode('mint'), provider.publicKey.toBytes()],
        program.programId,
    );

    const selfTokenAccountAddress = utils.token.associatedAddress({
        mint: mintAddress,
        owner: provider.publicKey,
    });

    it('should create a new mint account', async () => {
        await program.methods
            .createMint()
            .accountsStrict({
                wallet: provider.publicKey,
                mint: mintAddress,
                token: selfTokenAccountAddress,
                systemProgram: web3.SystemProgram.programId,
                tokenProgram: utils.token.TOKEN_PROGRAM_ID,
                associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
            })
            .rpc();
    });

    it('should mint balance into the admin token account', async () => {
        const inst = createMintToCheckedInstruction(mintAddress, selfTokenAccountAddress, provider.publicKey, 10000, 0);
        await provider.sendAndConfirm(new web3.Transaction().add(inst));
        const balance = await provider.connection.getTokenAccountBalance(selfTokenAccountAddress);
        expect(balance.value.uiAmount).eq(10000);
        const supply = await provider.connection.getTokenSupply(mintAddress);
        expect(supply.value.uiAmount).eq(10000);
    });

    it('should create a new contest', async () => {
        await program.methods
            .createContest('test', 'Test', new BN(10), new BN(200), 20)
            .accountsStrict({
                wallet: provider.publicKey,
                mint: mintAddress,
                src: selfTokenAccountAddress,
                dst: programTokenAccountAddress,
                contest: contestAddress,
                systemProgram: web3.SystemProgram.programId,
                tokenProgram: utils.token.TOKEN_PROGRAM_ID,
            })
            .rpc();
        const {
            host,
            slug,
            name,
            stake,
            mint,
            offset,
            participants: [first, ...rest],
        } = await program.account.contest.fetch(contestAddress);
        expect(provider.publicKey.equals(host)).toBeTruthy();
        expect(slug).eq('test');
        expect(name).eq('Test');
        expect(mint.equals(mintAddress)).toBeTruthy();
        expect(stake.eqn(10)).toBeTruthy();
        expect(offset).eq(20);
        expect(first?.token.equals(selfTokenAccountAddress)).toBeTruthy();
        expect(first?.delay.eqn(200)).toBeTruthy();
        expect(rest).toHaveLength(0);
    });

    it('should have caused the host balance to decrease due to contest creation', async () => {
        const ctx = await provider.connection.getTokenAccountBalance(selfTokenAccountAddress);
        expect(ctx.value.decimals).eq(0);
        expect(ctx.value.uiAmount).eq(9990);
    });

    it('should have caused the program balance to increase due to contest creation', async () => {
        const ctx = await provider.connection.getTokenAccountBalance(programTokenAccountAddress);
        expect(ctx.value.decimals).eq(0);
        expect(ctx.value.uiAmount).eq(10);
    });

    const other = web3.Keypair.generate();
    const otherTokenAccountAddress = utils.token.associatedAddress({
        mint: mintAddress,
        owner: other.publicKey,
    });

    it('should airdrop to a new second account with rent exemption', async () => {
        const rent = await provider.connection.getMinimumBalanceForRentExemption(0);
        const tx = await provider.connection.requestAirdrop(other.publicKey, rent + 10000);
        const ctx = await provider.connection.confirmTransaction(tx);
        expect(ctx.value.err).toBeNull();
    });

    it('should initialize a new associated token account for the user', async () => {
        const inst = createAssociatedTokenAccountInstruction(
            provider.publicKey,
            otherTokenAccountAddress,
            other.publicKey,
            mintAddress,
        );
        await provider.sendAndConfirm(new web3.Transaction().add(inst));
        const balance = await provider.connection.getTokenAccountBalance(otherTokenAccountAddress);
        expect(balance.value.uiAmount).eq(0);
    });

    it('should mint balance into the user token account', async () => {
        const inst = createMintToCheckedInstruction(mintAddress, otherTokenAccountAddress, provider.publicKey, 5000, 0);
        await provider.sendAndConfirm(new web3.Transaction().add(inst));
        const balance = await provider.connection.getTokenAccountBalance(otherTokenAccountAddress);
        expect(balance.value.uiAmount).eq(5000);
        const supply = await provider.connection.getTokenSupply(mintAddress);
        expect(supply.value.uiAmount).eq(15000);
    });

    it('should join an existing contest with perfect accuracy', async () => {
        await program.methods
            .joinContest('test', new BN(200))
            .accountsStrict({
                wallet: other.publicKey,
                admin: provider.publicKey,
                mint: mintAddress,
                src: otherTokenAccountAddress,
                dst: programTokenAccountAddress,
                contest: contestAddress,
                systemProgram: web3.SystemProgram.programId,
                tokenProgram: utils.token.TOKEN_PROGRAM_ID,
                associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
            })
            .signers([other])
            .rpc();
        const {
            host,
            slug,
            name,
            stake,
            mint,
            offset,
            participants: [first, second, ...rest],
        } = await program.account.contest.fetch(contestAddress);
        expect(provider.publicKey.equals(host)).toBeTruthy();
        expect(slug).eq('test');
        expect(name).eq('Test');
        expect(mint.equals(mintAddress)).toBeTruthy();
        expect(stake.eqn(10)).toBeTruthy();
        expect(offset).eq(20);
        expect(first?.token.equals(selfTokenAccountAddress)).toBeTruthy();
        expect(first?.delay.eqn(200)).toBeTruthy();
        expect(second?.token.equals(otherTokenAccountAddress)).toBeTruthy();
        expect(second?.delay.eqn(200)).toBeTruthy();
        expect(rest).toBeTruthy();
    });

    it('should have caused the user balance to decrease due to contest join', async () => {
        const ctx = await provider.connection.getTokenAccountBalance(otherTokenAccountAddress);
        expect(ctx.value.decimals).eq(0);
        expect(ctx.value.uiAmount).eq(4990);
    });

    it('should have caused the program balance to increase due to contest join', async () => {
        const ctx = await provider.connection.getTokenAccountBalance(programTokenAccountAddress);
        expect(ctx.value.decimals).eq(0);
        expect(ctx.value.uiAmount).eq(20);
    });

    it('should close an existing contest', async () => {
        await program.methods
            .closeContest('test')
            .accountsStrict({
                wallet: provider.publicKey,
                mint: mintAddress,
                token: programTokenAccountAddress,
                contest: contestAddress,
                archive: archiveAddress,
                systemProgram: web3.SystemProgram.programId,
                tokenProgram: utils.token.TOKEN_PROGRAM_ID,
            })
            .remainingAccounts([
                { pubkey: selfTokenAccountAddress, isSigner: false, isWritable: true },
                { pubkey: otherTokenAccountAddress, isSigner: false, isWritable: true },
            ])
            .rpc();
        const contest = await program.account.contest.fetchNullable(contestAddress);
        expect(contest).toBeNull();
        const info = await provider.connection.getAccountInfo(programTokenAccountAddress);
        expect(info).toBeNull();
        // FIXME: Make sure that the `self` has at least some balance in return.
        const selfBalance = await provider.connection.getTokenAccountBalance(selfTokenAccountAddress);
        expect(selfBalance.value.decimals).eq(0);
        expect(selfBalance.value.uiAmount).eq(9990);
        const otherBalance = await provider.connection.getTokenAccountBalance(otherTokenAccountAddress);
        expect(otherBalance.value.decimals).eq(0);
        expect(otherBalance.value.uiAmount).eq(5010);
    });

    it('should transfer tokens', async () => {
        await program.methods
            .transferTokens(new BN(90))
            .accountsStrict({
                wallet: provider.publicKey,
                target: other.publicKey,
                mint: mintAddress,
                src: selfTokenAccountAddress,
                dst: otherTokenAccountAddress,
                systemProgram: web3.SystemProgram.programId,
                tokenProgram: utils.token.TOKEN_PROGRAM_ID,
                associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
            })
            .rpc();
        const selfBalance = await provider.connection.getTokenAccountBalance(selfTokenAccountAddress);
        expect(selfBalance.value.decimals).eq(0);
        expect(selfBalance.value.uiAmount).eq(9900);
        const otherBalance = await provider.connection.getTokenAccountBalance(otherTokenAccountAddress);
        expect(otherBalance.value.decimals).eq(0);
        expect(otherBalance.value.uiAmount).eq(5100);
    });
});
