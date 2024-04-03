<script lang="ts">
    import { validateFormInteger, validateFormString } from '$lib/form';
    import { Dapped } from '$lib/program';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { PlusCircle } from '@steeze-ui/heroicons';
    import { assert } from '$lib/assert';
    import { createEventDispatcher } from 'svelte';
    import { getToastStore } from '@skeletonlabs/skeleton';
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
            const mint = new web3.PublicKey(validateFormString(data.get('mint')));
            const wallet = new web3.PublicKey(validateFormString(data.get('wallet')));
            const amount = validateFormInteger(data.get('amount'));
            await program.mintTo(mint, wallet, amount, 0);
            toast.trigger({
                message: `Successfully minted ${amount} to ${wallet}.`,
                background: 'variant-filled-success',
            });
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
        <span>Mint Address</span>
        <input required type="text" name="mint" placeholder="Mint" value={mint} class="input px-4 py-2 font-mono" />
    </label>
    <label class="label">
        <span>Wallet Address</span>
        <input required type="text" name="wallet" placeholder="Wallet" class="input px-4 py-2 font-mono" />
    </label>
    <label class="label">
        <span>Amount</span>
        <input required type="number" min="1" name="amount" placeholder="Amount" class="input px-4 py-2" />
    </label>
    <button type="submit" class="variant-filled-success btn w-full">
        <Icon src={PlusCircle} theme="mini" class="size-8" />
        <span>Mint To</span>
    </button>
</form>
