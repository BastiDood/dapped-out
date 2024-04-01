<script lang="ts">
    import { validateFormInteger, validateFormPublicKey } from '$lib/form';
    import { Dapped } from '$lib/program';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { PlusCircle } from '@steeze-ui/heroicons';
    import { assert } from '$lib/assert';
    import { createEventDispatcher } from 'svelte';
    import { getToastStore } from '@skeletonlabs/skeleton';

    // eslint-disable-next-line init-declarations
    export let program: Dapped;

    const toast = getToastStore();
    const dispatch = createEventDispatcher<{ mint: string }>();
    async function submit(form: HTMLFormElement, button: HTMLElement | null) {
        assert(button !== null, 'submitter is null');
        assert(button instanceof HTMLButtonElement, 'submitter is not a button');
        button.disabled = true;
        try {
            const data = new FormData(form);
            const amount = validateFormInteger(data.get('amount'));
            const address = validateFormPublicKey(data.get('address'));
            const tx = await program.mintTo(amount, address);
            toast.trigger({
                message: `Successfully minted ${amount} to ${address}.`,
                background: 'variant-filled-success',
            });
            dispatch('mint', tx);
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
        <span>Token Account Address</span>
        <input
            required
            type="text"
            name="address"
            placeholder="Address"
            value={program.userTokenAddress}
            class="input px-4 py-2 font-mono"
        />
    </label>
    <label class="label">
        <span>Amount</span>
        <input required type="number" name="amount" placeholder="Amount" class="input px-4 py-2" />
    </label>
    <button type="submit" class="variant-filled-success btn w-full">
        <Icon src={PlusCircle} theme="mini" class="size-8" />
        <span>Mint To</span>
    </button>
</form>
