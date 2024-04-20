<script lang="ts">
    import { utils, web3 } from '@coral-xyz/anchor';
    import CreateMint from './CreateMint.svelte';
    import type { Dapped } from '$lib/program';
    import DisplayMint from './DisplayMint.svelte';
    import ErrorAlert from '$lib/alerts/Error.svelte';
    import MintTo from './MintTo.svelte';
    import { ProgressBar } from '@skeletonlabs/skeleton';
    import TransferTokens from './TransferTokens.svelte';
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
</script>

<div class="space-y-4">
    {#key program}
        {#key refresh}
            {#await getMint()}
                <ProgressBar />
            {:then mint}
                {#if mint === null}
                    <WarningAlert>You have not yet created a mint account for this app.</WarningAlert>
                    <CreateMint {program} on:create={refreshMint} />
                {:else}
                    {@const { isInitialized, address, decimals, supply, mintAuthority, freezeAuthority } = mint}
                    {#if isInitialized}
                        <DisplayMint {address} {decimals} {supply} {mintAuthority} {freezeAuthority} />
                        <hr />
                        {#if mintAuthority !== null && program.walletAddress.equals(mintAuthority)}
                            <MintTo mint={address} {program} on:mint={refreshMint} />
                            <hr />
                            <TransferTokens mint={address} {program} on:transfer={refreshMint} />
                        {/if}
                    {:else}
                        <WarningAlert>This mint account has not been initialized yet.</WarningAlert>
                    {/if}
                {/if}
            {:catch err}
                <ErrorAlert>{err}</ErrorAlert>
            {/await}
        {/key}
    {/key}
</div>
