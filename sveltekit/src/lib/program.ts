import { type AnchorProvider, BN, Program, utils, web3 } from '@coral-xyz/anchor';
import { type DappedOut, IDL } from '../../../anchor/target/types/dapped_out';
import { createMintToCheckedInstruction } from '@solana/spl-token';

import { PUBLIC_DAPPED_ADDRESS } from '$lib/env';

export type DappedProgram = Program<DappedOut>;

class Dapped {
    /** Cached Anchor provider. */
    #provider: AnchorProvider;
    /** Anchor program. */
    #program: DappedProgram;
    /** Cached wallet address of the user. */
    #walletAddress: web3.PublicKey;
    /** Program-derived mint account (if any). */
    #mintAddress: web3.PublicKey;
    /** Associated token account address of the user. */
    #tokenAddress: web3.PublicKey;

    constructor(provider: AnchorProvider) {
        this.#provider = provider;
        this.#program = new Program(IDL, PUBLIC_DAPPED_ADDRESS, this.#provider);
        this.#walletAddress = provider.publicKey;
        const [mintAddress, _] = web3.PublicKey.findProgramAddressSync(
            [utils.bytes.utf8.encode('mint'), this.#walletAddress.toBuffer()],
            this.#program.programId,
        );
        this.#mintAddress = mintAddress;
        this.#tokenAddress = utils.token.associatedAddress({
            mint: this.#mintAddress,
            owner: this.#walletAddress,
        });
    }

    createMint() {
        return this.#program.methods
            .createMint()
            .accounts({
                wallet: this.#walletAddress,
                mint: this.#mintAddress,
                token: this.#tokenAddress,
                systemProgram: web3.SystemProgram.programId,
                tokenProgram: utils.token.TOKEN_PROGRAM_ID,
                associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
            })
            .rpc();
    }

    mintTo(amount: number | bigint) {
        const inst = createMintToCheckedInstruction(
            this.#mintAddress,
            this.#tokenAddress,
            this.#provider.publicKey,
            amount,
            0,
        );
        return this.#provider.sendAndConfirm(new web3.Transaction().add(inst));
    }

    createContest(
        slug: string,
        name: string,
        stake: BN,
        delay: BN,
        offset: number,
        src: web3.PublicKey,
        mint = this.#mintAddress,
    ) {
        const [contest, _] = web3.PublicKey.findProgramAddressSync(
            [utils.bytes.utf8.encode('contest'), this.#walletAddress.toBytes(), utils.bytes.utf8.encode(slug)],
            this.#program.programId,
        );
        return this.#program.methods
            .createContest(slug, name, stake, delay, offset)
            .accounts({
                wallet: this.#walletAddress,
                mint,
                src,
                dst: this.#tokenAddress,
                contest,
                systemProgram: web3.SystemProgram.programId,
                tokenProgram: utils.token.TOKEN_PROGRAM_ID,
            })
            .rpc();
    }

    joinContest(slug: string, stake: BN, admin: web3.PublicKey, src: web3.PublicKey, mint = this.#mintAddress) {
        const [contest, _] = web3.PublicKey.findProgramAddressSync(
            [utils.bytes.utf8.encode('contest'), this.#walletAddress.toBytes(), utils.bytes.utf8.encode(slug)],
            this.#program.programId,
        );
        return this.#program.methods
            .joinContest(slug, stake)
            .accounts({
                wallet: this.#walletAddress,
                admin,
                mint,
                src,
                dst: this.#tokenAddress,
                contest,
                systemProgram: web3.SystemProgram.programId,
                tokenProgram: utils.token.TOKEN_PROGRAM_ID,
                associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
            })
            .rpc();
    }

    closeContest(slug: string, tokens: web3.AccountMeta[], mint = this.#mintAddress) {
        const [contest, _contest] = web3.PublicKey.findProgramAddressSync(
            [utils.bytes.utf8.encode('contest'), this.#walletAddress.toBytes(), utils.bytes.utf8.encode(slug)],
            this.#program.programId,
        );
        const [archive, _archive] = web3.PublicKey.findProgramAddressSync(
            [utils.bytes.utf8.encode('archive'), this.#walletAddress.toBytes(), utils.bytes.utf8.encode(slug)],
            this.#program.programId,
        );
        return this.#program.methods
            .closeContest(slug)
            .accounts({
                wallet: this.#walletAddress,
                mint,
                token: this.#tokenAddress,
                contest,
                archive,
                systemProgram: web3.SystemProgram.programId,
                tokenProgram: utils.token.TOKEN_PROGRAM_ID,
            })
            .remainingAccounts(tokens)
            .rpc();
    }
}

export { IDL, Dapped };
