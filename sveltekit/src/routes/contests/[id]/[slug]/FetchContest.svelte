<script lang="ts">
    import { ProgressBar, getToastStore } from '@skeletonlabs/skeleton';
    import BN from 'bn.js';
    import { DappedContest } from '$lib/program';
    import DelayMeter from './DelayMeter.svelte';
    import ErrorAlert from '$lib/alerts/Error.svelte';
    import WarningAlert from '$lib/alerts/Warning.svelte';
    import { assert } from '$lib/assert';
    import { web3 } from '@coral-xyz/anchor';

    // eslint-disable-next-line init-declarations
    export let program: DappedContest;

    const toast = getToastStore();
    async function submit(form: HTMLFormElement, button: HTMLElement | null, admin: web3.PublicKey) {
        assert(button !== null, 'submitter is null');
        assert(button instanceof HTMLButtonElement, 'submitter is not a button');
        button.disabled = true;
        try {
            const meter = form.elements.namedItem('delay');
            assert(meter !== null, 'delay meter is null');
            assert(meter instanceof HTMLInputElement, 'delay meter is not an input');
            const delay = parseInt(meter.value, 10);
            if (delay <= 0) return;
            await program.joinContest(new BN(delay));
        } catch (err) {
            if (err instanceof Error)
                toast.trigger({
                    message: err.message,
                    background: 'variant-filled-primary',
                });
            console.error(err);
            throw err;
        } finally {
            // eslint-disable-next-line require-atomic-updates
            button.disabled = false;
        }
    }
</script>

<div class="space-y-4">
    {#await program.fetch()}
        <ProgressBar />
    {:then { host, name, participants }}
        <h1 class="h1">{name}</h1>
        {#if participants.some(({ token }) => program.dapped.userTokenAddress.equals(token))}
            <WarningAlert>You are already a participant of this contest.</WarningAlert>
        {:else}
            <form
                on:submit|self|preventDefault|stopPropagation={({ currentTarget, submitter }) =>
                    submit(currentTarget, submitter, host)}
            >
                <DelayMeter id="delay" name="delay" max={2000} targets={participants} />
            </form>
        {/if}
    {:catch err}
        <ErrorAlert>{err}</ErrorAlert>
    {/await}
</div>
