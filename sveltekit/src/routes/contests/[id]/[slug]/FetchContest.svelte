<script lang="ts">
    import { ProgressBar, getToastStore } from '@skeletonlabs/skeleton';
    import { utils, web3 } from '@coral-xyz/anchor';
    import BN from 'bn.js';
    import { DappedContest } from '$lib/program';
    import DelayMeter from './DelayMeter.svelte';
    import ErrorAlert from '$lib/alerts/Error.svelte';
    import { Icon } from '@steeze-ui/svelte-icon';
    import ParticipantVisualizer from './ParticipantVisualizer.svelte';
    import WarningAlert from '$lib/alerts/Warning.svelte';
    import { XCircle } from '@steeze-ui/heroicons';
    import { assert } from '$lib/assert';
    import { goto } from '$app/navigation';

    // eslint-disable-next-line init-declarations
    export let program: DappedContest;

    let refresh = Symbol();

    const toast = getToastStore();
    async function submit(form: HTMLFormElement, button: HTMLElement | null, mint: web3.PublicKey) {
        assert(button !== null, 'submitter is null');
        assert(button instanceof HTMLButtonElement, 'submitter is not a button');
        button.disabled = true;
        try {
            const meter = form.elements.namedItem('delay');
            assert(meter !== null, 'delay meter is null');
            assert(meter instanceof HTMLInputElement, 'delay meter is not an input');
            const delay = parseInt(meter.value, 10);
            if (delay <= 0) return;
            await program.joinContest(new BN(delay), mint);
            refresh = Symbol();
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

    async function archive(button: HTMLButtonElement, tokens: web3.AccountMeta[], mint: web3.PublicKey) {
        button.disabled = true;
        try {
            await program.closeContest(tokens, mint);
            await goto('/archives/');
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

<div class="space-y-4">
    {#key refresh}
        {#await program.fetch()}
            <ProgressBar />
        {:then { host, mint, stake, name, participants }}
            {@const selfToken = utils.token.associatedAddress({ mint, owner: program.dapped.walletAddress })}
            <h1 class="h1">{name}</h1>
            <p>Hosted by <code class="code">{host}</code>.</p>
            <p>This contest requires <code class="code">{stake}</code> staked tokens per attempt. With {participants.length} participants, the total pot is <code class="code">{stake.muln(participants.length)}</code>.</p>
            {#if program.dapped.walletAddress.equals(host)}
                {@const metas = participants.map(({ token }) => ({ pubkey: token, isSigner: false, isWritable: true }))}
                <ParticipantVisualizer id="delay" name="delay" max={2000} targets={participants}
                    >Participants</ParticipantVisualizer
                >
                <button
                    type="button"
                    class="variant-filled-error btn"
                    on:click={({ currentTarget }) => archive(currentTarget, metas, mint)}
                >
                    <Icon src={XCircle} theme="mini" class="size-6" />
                    <span>Close Contest</span>
                </button>
            {:else if participants.some(({ token }) => selfToken.equals(token))}
                <WarningAlert>You are already a participant of this contest.</WarningAlert>
                <ParticipantVisualizer id="delay" name="delay" max={2000} targets={participants}
                    >Participants</ParticipantVisualizer
                >
            {:else}
                {#await program.dapped.getTokenBalance(selfToken)}
                    <ProgressBar />
                {:then { value: { amount, decimals } }}
                    {@const value = new BN(amount).muln(10 ** decimals)}
                    <p>
                        You have <code class="code">{value}</code> tokens of the mint <code class="code">{mint}</code> remaining.
                    </p>
                {:catch err}
                    <ErrorAlert>{err}</ErrorAlert>
                {/await}
                <form
                    on:submit|self|preventDefault|stopPropagation={({ currentTarget, submitter }) =>
                        submit(currentTarget, submitter, mint)}
                >
                    <DelayMeter id="delay" name="delay" max={2000} targets={participants}>Participants</DelayMeter>
                </form>
            {/if}
        {:catch err}
            <ErrorAlert>{err}</ErrorAlert>
        {/await}
    {/key}
</div>
