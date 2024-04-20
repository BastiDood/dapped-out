<script lang="ts">
    import { validateFormInteger, validateFormString } from '$lib/form';
    import { ArrowsRightLeft } from '@steeze-ui/heroicons';
    import { BN } from 'bn.js';
    import { Dapped } from '$lib/program';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { assert } from '$lib/assert';
    import { createEventDispatcher } from 'svelte';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { web3 } from '@coral-xyz/anchor';

    // eslint-disable-next-line init-declarations
    export let program: Dapped;
    // eslint-disable-next-line init-declarations
    export let mint: web3.PublicKey;

    const toast = getToastStore();
    const dispatch = createEventDispatcher<{ transfer: null }>();
    async function submit(form: HTMLFormElement, button: HTMLElement | null) {
        assert(button !== null, 'submitter is null');
        assert(button instanceof HTMLButtonElement, 'submitter is not a button');
        button.disabled = true;
        try {
            const data = new FormData(form);
            const target = new web3.PublicKey(validateFormString(data.get('target')));
            const amount = validateFormInteger(data.get('amount'));
            await program.transferTokens(mint, program.walletAddress, target, new BN(amount));
            toast.trigger({ message: 'Tokens successfully transferred.', background: 'variant-filled-success' });
            dispatch('transfer');
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
        <span>Target Wallet</span>
        <input required type="text" name="target" placeholder="Wallet" class="input px-4 py-2 font-mono" />
    </label>
    <label class="label">
        <span>Amount</span>
        <input required type="number" min="1" name="amount" placeholder="Amount" class="input px-4 py-2" />
    </label>
    <button type="submit" class="variant-filled-success btn w-full">
        <Icon src={ArrowsRightLeft} theme="mini" class="size-8" />
        <span>Transfer</span>
    </button>
</form>
