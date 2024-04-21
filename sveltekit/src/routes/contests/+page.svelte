<script lang="ts">
    import { Status, getWallet } from '$lib/wallet';
    import ConnectWalletButton from '$lib/components/ConnectWalletButton.svelte';
    import ErrorAlert from '$lib/alerts/Error.svelte';
    import ListContests from './ListContests.svelte';
    import WarningAlert from '$lib/alerts/Warning.svelte';
    const anchor = getWallet();
</script>

<div class="space-y-4">
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
            >Solana wallets detected, but not with <a href="https://phantom.app/" target="_blank" class="anchor"
                >Phantom</a
            >.</WarningAlert
        >
    {:else}
        <ListContests program={$anchor} />
    {/if}
</div>
