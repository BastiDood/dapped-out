// https://github.com/anza-xyz/wallet-adapter/blob/a8e4bdee26b4e4d1dd6b321999eb57c8516d775a/packages/wallets/phantom/src/adapter.ts

import type { EventEmitter } from '@solana/wallet-adapter-base';
import type { web3 } from '@coral-xyz/anchor';

export interface PhantomWalletEvents {
    connect(key: web3.PublicKey): void;
    disconnect(): void;
    accountChanged(key?: web3.PublicKey | null): void;
}

export interface PhantomWallet extends EventEmitter<PhantomWalletEvents> {
    isPhantom?: boolean;
    publicKey?: web3.PublicKey;
    isConnected: boolean;
    signTransaction<T extends web3.Transaction | web3.VersionedTransaction>(transaction: T): Promise<T>;
    signAllTransactions<T extends web3.Transaction | web3.VersionedTransaction>(transactions: T[]): Promise<T[]>;
    signAndSendTransaction<T extends web3.Transaction | web3.VersionedTransaction>(
        transaction: T,
        options?: web3.SendOptions,
    ): Promise<{ signature: web3.TransactionSignature }>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
    connect(opts?: { onlyIfTrusted?: boolean }): Promise<void>;
    disconnect(): Promise<void>;
}

declare global {
    interface Window {
        phantom?: { solana?: PhantomWallet };
        solana?: PhantomWallet;
    }
}
