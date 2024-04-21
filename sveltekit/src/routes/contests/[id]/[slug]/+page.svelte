<script lang="ts">
    import { Status, getWallet } from '$lib/wallet';
    import ConnectWalletButton from '$lib/components/ConnectWalletButton.svelte';
    import { DappedContest } from '$lib/program';
    import ErrorAlert from '$lib/alerts/Error.svelte';
    import FetchContest from './FetchContest.svelte';
    import WarningAlert from '$lib/alerts/Warning.svelte';
    import { web3 } from '@coral-xyz/anchor';

    // eslint-disable-next-line init-declarations
    export let data;
    $: ({ id, slug } = data);
    $: host = new web3.PublicKey(id);

    const anchor = getWallet();
</script>

{#if $anchor === Status.Idle}
    <ConnectWalletButton />
{:else if $anchor === Status.Unavailable}
    <ErrorAlert
        >No Solana wallets available. Consider installing the <a
            href="https://phantom.app/"
            target="_blank"
            class="anchor">Phantom</a
        > wallet.</ErrorAlert
    >
{:else if $anchor === Status.Unsupported}
    <WarningAlert
        >Solana wallets detected, but not with <a href="https://phantom.app/" target="_blank" class="anchor">Phantom</a
        >.</WarningAlert
    >
{:else}
    {@const program = new DappedContest($anchor, host, slug)}
    <FetchContest {program} />
{/if}
