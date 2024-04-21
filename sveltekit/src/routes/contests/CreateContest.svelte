<script lang="ts">
    import { type Dapped, DappedContest } from '$lib/program';
    import { validateFormInteger, validateFormString } from '$lib/form';
    import BN from 'bn.js';
    import DelayMeter from './DelayMeter.svelte';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { PlusCircle } from '@steeze-ui/heroicons';
    import { assert } from '$lib/assert';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { goto } from '$app/navigation';
    import { web3 } from '@coral-xyz/anchor';

    // eslint-disable-next-line init-declarations
    export let program: Dapped;

    const toast = getToastStore();
    async function submit(form: HTMLFormElement, button: HTMLElement | null) {
        assert(button !== null, 'submitter is null');
        assert(button instanceof HTMLButtonElement, 'submitter is not a button');
        button.disabled = true;
        try {
            const meter = form.elements.namedItem('delay');
            assert(meter !== null, 'delay meter is null');
            assert(meter instanceof HTMLInputElement, 'delay meter is not an input');
            const value = parseInt(meter.value, 10);
            if (value <= 0) {
                toast.trigger({
                    message: 'Please set a valid delay.',
                    background: 'variant-filled-error',
                });
                return;
            }
            const delay = new BN(value);
            const data = new FormData(form);
            const slug = validateFormString(data.get('slug'));
            const name = validateFormString(data.get('name'));
            const mint = new web3.PublicKey(validateFormString(data.get('mint')));
            const stake = new BN(validateFormInteger(data.get('stake')));
            const offset = validateFormInteger(data.get('offset'));
            const dapped = new DappedContest(program, program.walletAddress, slug);
            await dapped.createContest(name, stake, delay, offset, mint);
            await goto(`/contests/${program.walletAddress}/${slug}/`);
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
        <span>A unique URL slug for this contest.</span>
        <input
            required
            type="text"
            maxlength="16"
            pattern="[a-zA-Z0-9_\-]+"
            name="slug"
            placeholder="Slug"
            class="input px-4 py-2"
        />
    </label>
    <label class="label">
        <span>A human-readable name for your contest.</span>
        <input required type="text" maxlength="16" name="name" placeholder="Name" class="input px-4 py-2" />
    </label>
    <label class="label">
        <span>The address of the mint being staked.</span>
        <input required type="text" name="mint" placeholder="Mint" class="input px-4 py-2 font-mono" />
    </label>
    <label class="label">
        <span>Fixed amount of tokens required to join the contest.</span>
        <input required type="number" min="1" name="stake" placeholder="Stake" class="input px-4 py-2" />
    </label>
    <DelayMeter name="delay" max={2000}
        >The target timing of the contest. Press the clock to start. Press again to stop.</DelayMeter
    >
    <label class="label">
        <span>The contest difficulty measured as the allowed leeway (in milliseconds) around the target timing.</span>
        <input required type="number" min="1" name="offset" placeholder="Difficulty" class="input px-4 py-2" />
    </label>
    <button type="submit" class="variant-filled-success btn w-full">
        <Icon src={PlusCircle} theme="mini" class="size-8" />
        <span>Create Contest</span>
    </button>
</form>
