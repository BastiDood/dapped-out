<script lang="ts">
    import { CurrencyDollar } from '@steeze-ui/heroicons';
    import type { Dapped } from '$lib/program';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { createEventDispatcher } from 'svelte';
    import { getToastStore } from '@skeletonlabs/skeleton';

    // eslint-disable-next-line init-declarations
    export let program: Dapped;

    const dispatch = createEventDispatcher<{ create: null }>();
    const toast = getToastStore();
    async function createMint(button: HTMLButtonElement) {
        button.disabled = true;
        try {
            await program.createMint();
            toast.trigger({ message: 'Mint successfully created.', background: 'variant-filled-success' });
            dispatch('create');
        } catch (err) {
            if (err instanceof Error)
                toast.trigger({
                    message: err.message,
                    background: 'variant-filled-error',
                });
            console.error(err);
            throw err;
        } finally {
            button.disabled = false;
        }
    }
</script>

<button type="button" class="variant-filled-primary btn" on:click={({ currentTarget }) => createMint(currentTarget)}>
    <Icon src={CurrencyDollar} theme="mini" class="size-8" />
    <span>Create Mint</span>
</button>
