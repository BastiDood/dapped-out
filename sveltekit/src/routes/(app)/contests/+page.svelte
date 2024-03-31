<script lang="ts">
    import { Status, get } from '$lib/wallet';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { Wallet } from '@steeze-ui/heroicons';
    import { getToastStore } from '@skeletonlabs/skeleton';

    import ErrorAlert from '$lib/alerts/Error.svelte';
    import WarningAlert from '$lib/alerts/Warning.svelte';

    const anchor = get();
    const toast = getToastStore();

    async function connect(button: HTMLButtonElement) {
        button.disabled = true;
        try {
            await anchor.connect();
        } catch (err) {
            if (err instanceof Error) {
                toast.trigger({ message: err.message, background: 'variant-filled-error' });
                if ('code' in err && typeof err.code === 'number' && err.code === 4001) return;
            }
            throw err;
        } finally {
            button.disabled = false;
        }
    }
</script>

{#if $anchor === Status.Idle}
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
    <p>Connected!</p>
{/if}
