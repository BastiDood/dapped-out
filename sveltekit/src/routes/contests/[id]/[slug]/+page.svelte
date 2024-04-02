<script lang="ts">
    import { ProgressBar, getToastStore } from '@skeletonlabs/skeleton';
    import { Status, get } from '$lib/wallet';
    import { DappedContest } from '$lib/program';
    import FetchContest from './FetchContest.svelte';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { Wallet } from '@steeze-ui/heroicons';
    import { web3 } from '@coral-xyz/anchor';

    import ErrorAlert from '$lib/alerts/Error.svelte';
    import WarningAlert from '$lib/alerts/Warning.svelte';

    // eslint-disable-next-line init-declarations
    export let data;
    $: ({ id, slug } = data);
    $: host = new web3.PublicKey(id);

    const anchor = get();
    const toast = getToastStore();

    async function connect(button: HTMLButtonElement) {
        button.disabled = true;
        try {
            await anchor.connect();
        } catch (err) {
            if (err instanceof Error) toast.trigger({ message: err.message, background: 'variant-filled-error' });
            throw err;
        } finally {
            button.disabled = false;
        }
    }
</script>

{#if $anchor === Status.None}
    <ProgressBar />
{:else if $anchor === Status.Idle}
    <button type="button" class="variant-filled-primary btn" on:click={({ currentTarget }) => connect(currentTarget)}>
        <Icon src={Wallet} theme="mini" class="size-8" />
        <span>Connect Your Wallet</span>
    </button>
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
    {@const program = new DappedContest($anchor, slug, host)}
    <FetchContest {program} />
{/if}
