import { AnchorProvider, web3 } from '@coral-xyz/anchor';
import { getContext, hasContext, setContext } from 'svelte';
import { Dapped } from '$lib/program';
import { assert } from '$lib/assert';
import { browser } from '$app/environment';
import { readable } from 'svelte/store';

import { PUBLIC_SOLANA_RPC } from '$lib/env';

const WALLET = Symbol('wallet');
const CONNECTION = new web3.Connection(PUBLIC_SOLANA_RPC);

export const enum Status {
    /** Default state while confirming the wallet. */
    None,
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
    return Status.None;
}

function create() {
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

    const { subscribe } = readable(Status.None as Dapped | Status, set => {
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

type Store = ReturnType<typeof create>;

export function init() {
    setContext(WALLET, create());
}

export function get() {
    assert(hasContext(WALLET), 'wallet not initialized');
    return getContext<Store>(WALLET);
}
