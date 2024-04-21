<script>
    import { Icon } from '@steeze-ui/svelte-icon';
    import { Wallet } from '@steeze-ui/heroicons';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { getWallet } from '$lib/wallet';

    const anchor = getWallet();
    const toast = getToastStore();

    /** @param {HTMLButtonElement} button */
    async function connect(button) {
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

<button type="button" class="variant-filled-primary btn" on:click={({ currentTarget }) => connect(currentTarget)}>
    <Icon src={Wallet} theme="mini" class="size-6" />
    <span>Connect Your Wallet</span>
</button>
