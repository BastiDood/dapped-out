<script lang="ts">
    import { Dapped } from '$lib/program';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { PlusCircle } from '@steeze-ui/heroicons';
    import { assert } from '$lib/assert';
    import { createEventDispatcher } from 'svelte';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { validateFormInteger } from '$lib/form';
    import { web3 } from '@coral-xyz/anchor';

    // eslint-disable-next-line init-declarations
    export let program: Dapped;
    // eslint-disable-next-line init-declarations
    export let mint: web3.PublicKey;

    const toast = getToastStore();
    const dispatch = createEventDispatcher<{ mint: null }>();
    async function submit(form: HTMLFormElement, button: HTMLElement | null) {
        assert(button !== null, 'submitter is null');
        assert(button instanceof HTMLButtonElement, 'submitter is not a button');
        button.disabled = true;
        try {
            const data = new FormData(form);
            const amount = validateFormInteger(data.get('amount'));
            await program.mintTo(mint, program.walletAddress, amount, 0);
            toast.trigger({ message: 'Successfully minted.', background: 'variant-filled-success' });
            dispatch('mint');
        } catch (err) {
            if (err instanceof Error)
                toast.trigger({
                    message: err.message,
                    background: 'variant-filled-error',
                });
            console.error(err);
            throw err;
        } finally {
            // eslint-disable-next-line require-atomic-updates
            button.disabled = false;
        }
    }
</script>

<form
    on:submit|self|preventDefault|stopPropagation={({ currentTarget, submitter }) => submit(currentTarget, submitter)}
    class="space-y-4"
>
    <label class="label">
        <span>Amount</span>
        <input required type="number" min="1" name="amount" placeholder="Amount" class="input px-4 py-2" />
    </label>
    <button type="submit" class="variant-filled-success btn w-full">
        <Icon src={PlusCircle} theme="mini" class="size-8" />
        <span>Mint To</span>
    </button>
</form>
