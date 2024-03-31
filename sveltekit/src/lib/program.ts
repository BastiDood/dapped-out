import { type AnchorProvider, type BN, Program, utils, web3 } from '@coral-xyz/anchor';
import { type DappedOut, IDL } from '../../../anchor/target/types/dapped_out';
import { createMintToCheckedInstruction } from '@solana/spl-token';

import { PUBLIC_DAPPED_ADDRESS } from '$lib/env';

export type DappedProgram = Program<DappedOut>;

class Dapped {
    /** Cached Anchor provider. */
    #provider: AnchorProvider;
    /** Anchor program. */
    #program: DappedProgram;
    /** Program-derived mint account (if any). */
    #mintAddress: web3.PublicKey;
    /** Associated token account address of the user. */
    #userTokenAddress: web3.PublicKey;

    constructor(provider: AnchorProvider) {
        this.#provider = provider;
        this.#program = new Program(IDL, PUBLIC_DAPPED_ADDRESS, this.#provider);
        const walletAddress = this.#provider.publicKey;
        const [mintAddress, _] = web3.PublicKey.findProgramAddressSync(
            [utils.bytes.utf8.encode('mint'), walletAddress.toBuffer()],
            this.#program.programId,
        );
        this.#mintAddress = mintAddress;
        this.#userTokenAddress = utils.token.associatedAddress({
            mint: this.#mintAddress,
            owner: walletAddress,
        });
    }

    get walletAddress() {
        return this.#provider.publicKey;
    }

    get program() {
        return this.#program;
    }

    get mintAddress() {
        return this.#mintAddress;
    }

    get userTokenAddress() {
        return this.#userTokenAddress;
    }

    getBalance(target = this.#provider.publicKey) {
        return this.#provider.connection.getBalance(target);
    }

    getTokenBalance(target: web3.PublicKey) {
        return this.#provider.connection.getTokenAccountBalance(target);
    }

    getUserTokenBalance() {
        return this.getTokenBalance(this.#userTokenAddress);
    }

    createMint() {
        return this.#program.methods
            .createMint()
            .accounts({
                wallet: this.#provider.publicKey,
                mint: this.#mintAddress,
                token: this.#userTokenAddress,
                systemProgram: web3.SystemProgram.programId,
                tokenProgram: utils.token.TOKEN_PROGRAM_ID,
                associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
            })
            .rpc();
    }

    mintTo(target: web3.PublicKey, amount: number | bigint) {
        const inst = createMintToCheckedInstruction(this.#mintAddress, target, this.#provider.publicKey, amount, 0);
        return this.#provider.sendAndConfirm(new web3.Transaction().add(inst));
    }
}

class DappedContest {
    #dapped: Dapped;
    #slug: string;
    #programTokenAddress: web3.PublicKey;
    #contestAddress: web3.PublicKey;
    #archiveAddress: web3.PublicKey;

    constructor(dapped: Dapped, slug: string) {
        this.#dapped = dapped;
        this.#slug = slug;
        const { programId } = this.#dapped.program;
        const bytes = this.#dapped.walletAddress.toBytes();
        const [token, _dst] = web3.PublicKey.findProgramAddressSync(
            [utils.bytes.utf8.encode('token'), bytes, utils.bytes.utf8.encode(this.#slug)],
            programId,
        );
        this.#programTokenAddress = token;
        const [contest, _contest] = web3.PublicKey.findProgramAddressSync(
            [utils.bytes.utf8.encode('contest'), bytes, utils.bytes.utf8.encode(this.#slug)],
            programId,
        );
        this.#contestAddress = contest;
        const [archive, _archive] = web3.PublicKey.findProgramAddressSync(
            [utils.bytes.utf8.encode('archive'), bytes, utils.bytes.utf8.encode(this.#slug)],
            programId,
        );
        this.#archiveAddress = archive;
    }

    get dapped() {
        return this.#dapped;
    }

    createContest(
        name: string,
        stake: BN,
        delay: BN,
        offset: number,
        src: web3.PublicKey,
        mint = this.#dapped.mintAddress,
    ) {
        return this.#dapped.program.methods
            .createContest(this.#slug, name, stake, delay, offset)
            .accounts({
                wallet: this.#dapped.walletAddress,
                mint,
                src,
                dst: this.#programTokenAddress,
                contest: this.#contestAddress,
                systemProgram: web3.SystemProgram.programId,
                tokenProgram: utils.token.TOKEN_PROGRAM_ID,
            })
            .rpc();
    }

    joinContest(stake: BN, admin: web3.PublicKey, src: web3.PublicKey, mint = this.#dapped.mintAddress) {
        return this.#dapped.program.methods
            .joinContest(this.#slug, stake)
            .accounts({
                wallet: this.#dapped.walletAddress,
                admin,
                mint,
                src,
                dst: this.#programTokenAddress,
                contest: this.#contestAddress,
                systemProgram: web3.SystemProgram.programId,
                tokenProgram: utils.token.TOKEN_PROGRAM_ID,
                associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
            })
            .rpc();
    }

    closeContest(tokens: web3.AccountMeta[], mint = this.#dapped.mintAddress) {
        return this.#dapped.program.methods
            .closeContest(this.#slug)
            .accounts({
                wallet: this.#dapped.walletAddress,
                mint,
                token: this.#programTokenAddress,
                contest: this.#contestAddress,
                archive: this.#archiveAddress,
                systemProgram: web3.SystemProgram.programId,
                tokenProgram: utils.token.TOKEN_PROGRAM_ID,
            })
            .remainingAccounts(tokens)
            .rpc();
    }
}

export { Dapped, DappedContest, IDL };
