import { AnchorProvider, web3 } from '@coral-xyz/anchor';
import { derived, readable } from 'svelte/store';
import { getContext, hasContext, setContext } from 'svelte';
import { Dapped } from '$lib/program';
import { assert } from '$lib/assert';
import { browser } from '$app/environment';

import { PUBLIC_SOLANA_RPC } from '$lib/env';

const WALLET = Symbol('wallet');
const STATUS = Symbol('wallet:status');

export const enum Status {
    /** Idle, reject, or disconnected wallet. */
    Idle,
    /** No Solana wallets available. */
    Unavailable,
    /** Solana wallet detected but not Phantom. */
    Unsupported,
}

/**
 * @returns `undefined` if no Solana wallet available
 * @returns `null` if Phantom extension is not available
 * @returns valid wallet otherwise
 */
function getPhantom() {
    if (browser) {
        const phantom = window.phantom?.solana ?? window.solana;
        if (typeof phantom === 'undefined') return Status.Unavailable;
        return phantom.isPhantom === true ? phantom : Status.Unsupported;
    }
    return Status.Idle;
}

function createMainStore() {
    const phantom = getPhantom();
    if (typeof phantom === 'number') {
        const { subscribe } = readable(phantom);
        return {
            subscribe,
            async connect() {
                // NO-OP
            },
        };
    }

    const signTransaction = phantom.signTransaction.bind(phantom);
    const signAllTransactions = phantom.signAllTransactions.bind(phantom);

    const CONNECTION = new web3.Connection(PUBLIC_SOLANA_RPC);
    const { subscribe } = readable(Status.Idle as Dapped | Status, set => {
        // eslint-disable-next-line func-style
        const onConnect = () => {
            const bytes = phantom.publicKey?.toBytes();
            if (typeof bytes === 'undefined') return;
            const publicKey = new web3.PublicKey(bytes);
            const provider = new AnchorProvider(
                CONNECTION,
                { publicKey, signAllTransactions, signTransaction },
                AnchorProvider.defaultOptions(),
            );
            set(new Dapped(provider));
        };
        // eslint-disable-next-line func-style
        const onAccountChange = (key?: web3.PublicKey | null) => {
            if (key) {
                const bytes = key.toBytes();
                const publicKey = new web3.PublicKey(bytes);
                const provider = new AnchorProvider(
                    CONNECTION,
                    { publicKey, signAllTransactions, signTransaction },
                    AnchorProvider.defaultOptions(),
                );
                set(new Dapped(provider));
            } else set(Status.Idle);
        };
        // eslint-disable-next-line func-style
        const onDisconnect = () => set(Status.Idle);
        onConnect();
        phantom.on('connect', onConnect).on('accountChanged', onAccountChange).on('disconnect', onDisconnect);
        return () => {
            phantom.off('connect', onConnect).off('accountChanged', onAccountChange).off('disconnect', onDisconnect);
        };
    });
    return {
        subscribe,
        async connect(onlyIfTrusted = false) {
            await phantom.connect({ onlyIfTrusted });
        },
    };
}

type Store = ReturnType<typeof createMainStore>;

function createDerivedStore(store: Store) {
    return derived(store, val => val instanceof Dapped, false);
}

type Derived = ReturnType<typeof createDerivedStore>;

export function init() {
    const store = createMainStore();
    setContext(WALLET, store);
    setContext(STATUS, createDerivedStore(store));
}

export function getWallet() {
    assert(hasContext(WALLET), 'wallet not initialized');
    return getContext<Store>(WALLET);
}

export function getStatus() {
    assert(hasContext(STATUS), 'wallet not initialized');
    return getContext<Derived>(STATUS);
}
