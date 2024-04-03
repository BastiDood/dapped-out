import { type AnchorProvider, type BN, Program, utils, web3 } from '@coral-xyz/anchor';
import { type DappedOut, IDL } from '../../../anchor/target/types/dapped_out';
import { createMintToCheckedInstruction, getMint } from '@solana/spl-token';

import { PUBLIC_DAPPED_ADDRESS } from '$lib/env';

export type DappedProgram = Program<DappedOut>;

class Dapped {
    /** Cached Anchor provider. */
    #provider: AnchorProvider;
    /** Anchor program. */
    #program: DappedProgram;

    constructor(provider: AnchorProvider) {
        this.#provider = provider;
        this.#program = new Program(IDL, PUBLIC_DAPPED_ADDRESS, this.#provider);
    }

    get walletAddress() {
        return this.#provider.publicKey;
    }

    get program() {
        return this.#program;
    }

    getBalance(target = this.walletAddress) {
        return this.#provider.connection.getBalance(target);
    }

    getTokenBalance(target: web3.PublicKey) {
        return this.#provider.connection.getTokenAccountBalance(target);
    }

    async createMint() {
        const owner = this.walletAddress;
        const [mint, _] = web3.PublicKey.findProgramAddressSync(
            [utils.bytes.utf8.encode('mint'), owner.toBytes()],
            this.#program.programId,
        );
        const token = utils.token.associatedAddress({ mint, owner });
        const tx = await this.#program.methods
            .createMint()
            .accountsStrict({
                wallet: owner,
                mint,
                token,
                systemProgram: web3.SystemProgram.programId,
                tokenProgram: utils.token.TOKEN_PROGRAM_ID,
                associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
            })
            .rpc({ commitment: 'finalized' });
        console.log('createMint', tx);
    }

    async mintTo(mint: web3.PublicKey, owner: web3.PublicKey, amount: bigint | number, decimals: number) {
        const token = utils.token.associatedAddress({ mint, owner });
        const inst = createMintToCheckedInstruction(mint, token, this.walletAddress, amount, decimals);
        const transaction = new web3.Transaction().add(inst);
        const tx = await this.#provider.sendAndConfirm(transaction, [], { commitment: 'finalized' });
        console.log('mintTo', tx);
    }

    getMint(mint: web3.PublicKey) {
        return getMint(this.#provider.connection, mint);
    }

    fetchContests() {
        return this.#program.account.contest.all();
    }

    fetchContestByAddress(address: web3.PublicKey) {
        return this.#program.account.contest.fetch(address);
    }

    fetchContestByAdminAndSlug(admin: web3.PublicKey, slug: string) {
        const [contest, _] = web3.PublicKey.findProgramAddressSync(
            [utils.bytes.utf8.encode('contest'), admin.toBytes(), utils.bytes.utf8.encode(slug)],
            this.#program.programId,
        );
        return this.fetchContestByAddress(contest);
    }

    fetchArchives() {
        return this.#program.account.archive.all();
    }
}

class DappedContest {
    #dapped: Dapped;
    #host: web3.PublicKey;
    #slug: string;
    #programTokenAddress: web3.PublicKey;

    constructor(dapped: Dapped, host: web3.PublicKey, slug: string) {
        this.#dapped = dapped;
        this.#host = host;
        this.#slug = slug;
        const { programId } = this.#dapped.program;
        const bytes = this.#host.toBytes();
        const [token, _] = web3.PublicKey.findProgramAddressSync(
            [utils.bytes.utf8.encode('token'), bytes, utils.bytes.utf8.encode(this.#slug)],
            programId,
        );
        this.#programTokenAddress = token;
    }

    get dapped() {
        return this.#dapped;
    }

    async createContest(name: string, stake: BN, delay: BN, offset: number, mint: web3.PublicKey) {
        const owner = this.#host;
        const [contest, _] = web3.PublicKey.findProgramAddressSync(
            [utils.bytes.utf8.encode('mint'), owner.toBytes(), utils.bytes.utf8.encode(this.#slug)],
            this.#dapped.program.programId,
        );
        const tx = await this.#dapped.program.methods
            .createContest(this.#slug, name, stake, delay, offset)
            .accountsStrict({
                wallet: owner,
                mint,
                src: utils.token.associatedAddress({ mint, owner }),
                dst: this.#programTokenAddress,
                contest,
                systemProgram: web3.SystemProgram.programId,
                tokenProgram: utils.token.TOKEN_PROGRAM_ID,
            })
            .rpc({ commitment: 'finalized' });
        console.log('createContest', tx);
    }

    async joinContest(delay: BN, mint: web3.PublicKey) {
        const admin = this.#host;
        const [contest, _contest] = web3.PublicKey.findProgramAddressSync(
            [utils.bytes.utf8.encode('contest'), admin.toBytes(), utils.bytes.utf8.encode(this.#slug)],
            this.#dapped.program.programId,
        );
        const [dst, _dst] = web3.PublicKey.findProgramAddressSync(
            [utils.bytes.utf8.encode('token'), admin.toBytes(), utils.bytes.utf8.encode(this.#slug)],
            this.#dapped.program.programId,
        );
        const tx = await this.#dapped.program.methods
            .joinContest(this.#slug, delay)
            .accountsStrict({
                wallet: this.#dapped.walletAddress,
                admin,
                mint,
                src: utils.token.associatedAddress({ mint, owner: this.#dapped.walletAddress }),
                dst,
                contest,
                systemProgram: web3.SystemProgram.programId,
                tokenProgram: utils.token.TOKEN_PROGRAM_ID,
                associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
            })
            .rpc({ commitment: 'finalized' });
        console.log('joinContest', tx);
    }

    async closeContest(tokens: web3.AccountMeta[], mint: web3.PublicKey) {
        const admin = this.#host;
        const [contest, _contest] = web3.PublicKey.findProgramAddressSync(
            [utils.bytes.utf8.encode('contest'), admin.toBytes(), utils.bytes.utf8.encode(this.#slug)],
            this.#dapped.program.programId,
        );
        const [archive, _archive] = web3.PublicKey.findProgramAddressSync(
            [utils.bytes.utf8.encode('archive'), admin.toBytes(), utils.bytes.utf8.encode(this.#slug)],
            this.#dapped.program.programId,
        );
        const [token, _token] = web3.PublicKey.findProgramAddressSync(
            [utils.bytes.utf8.encode('token'), admin.toBytes(), utils.bytes.utf8.encode(this.#slug)],
            this.#dapped.program.programId,
        );
        const tx = await this.#dapped.program.methods
            .closeContest(this.#slug)
            .accountsStrict({
                wallet: this.#dapped.walletAddress,
                mint,
                token,
                contest,
                archive,
                systemProgram: web3.SystemProgram.programId,
                tokenProgram: utils.token.TOKEN_PROGRAM_ID,
            })
            .remainingAccounts(tokens)
            .rpc({ commitment: 'finalized' });
        console.log('closeContest', tx);
    }

    fetch() {
        return this.#dapped.fetchContestByAdminAndSlug(this.#host, this.#slug);
    }
}

export { Dapped, DappedContest, IDL };
