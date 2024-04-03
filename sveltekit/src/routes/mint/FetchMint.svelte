<script lang="ts">
    import { ProgressBar, getToastStore } from '@skeletonlabs/skeleton';
    import { utils, web3 } from '@coral-xyz/anchor';
    import { CurrencyDollar } from '@steeze-ui/heroicons';
    import type { Dapped } from '$lib/program';
    import DisplayMint from './DisplayMint.svelte';
    import ErrorAlert from '$lib/alerts/Error.svelte';
    import { Icon } from '@steeze-ui/svelte-icon';
    import MintTo from './MintTo.svelte';
    import WarningAlert from '$lib/alerts/Warning.svelte';

    // eslint-disable-next-line init-declarations
    export let program: Dapped;
    $: [mint, _] = web3.PublicKey.findProgramAddressSync(
        [utils.bytes.utf8.encode('mint'), program.walletAddress.toBytes()],
        program.program.programId,
    );

    let refresh = Symbol();
    function refreshMint() {
        refresh = Symbol();
    }

    async function getMint() {
        try {
            return await program.getMint(mint);
        } catch (err) {
            if (err instanceof Error && err.name === 'TokenAccountNotFoundError') return null;
            throw err;
        }
    }

    const toast = getToastStore();
    async function createMint(button: HTMLButtonElement) {
        button.disabled = true;
        try {
            await program.createMint();
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

<div class="space-y-4">
    {#key refresh}
        {#await getMint()}
            <ProgressBar />
        {:then mint}
            {#if mint === null}
                <WarningAlert>You have not yet created a mint account for this app.</WarningAlert>
                <button
                    type="button"
                    class="variant-filled-primary btn"
                    on:click={({ currentTarget }) => createMint(currentTarget)}
                >
                    <Icon src={CurrencyDollar} theme="mini" class="size-8" />
                    <span>Create Mint</span>
                </button>
            {:else}
                {@const { isInitialized, address, decimals, supply, mintAuthority, freezeAuthority } = mint}
                {#if isInitialized}
                    <DisplayMint {address} {decimals} {supply} {mintAuthority} {freezeAuthority} />
                    {#if mintAuthority !== null && program.walletAddress.equals(mintAuthority)}
                        <MintTo mint={address} {program} on:mint={refreshMint} />
                    {/if}
                {:else}
                    <WarningAlert>This mint account has not been initialized yet.</WarningAlert>
                {/if}
            {/if}
        {:catch err}
            <ErrorAlert>{err}</ErrorAlert>
        {/await}
    {/key}
</div>
