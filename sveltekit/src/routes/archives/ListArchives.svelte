<script lang="ts">
    import type { Dapped } from '$lib/program';
    import ErrorAlert from '$lib/alerts/Error.svelte';
    import { ProgressBar } from '@skeletonlabs/skeleton';
    import WarningAlert from '$lib/alerts/Warning.svelte';
    // eslint-disable-next-line init-declarations
    export let program: Dapped;
</script>

{#await program.fetchArchives()}
    <ProgressBar />
{:then archives}
    {#if archives.length === 0}
        <WarningAlert>There are no archives yet.</WarningAlert>
    {:else}
        <div class="grid grid-cols-[repeat(auto-fill,minmax(30ch,1fr))]">
            {#each archives as { account: { name, mint, participants } }}
                <!-- TODO: Display more information. -->
                <div class="group card p-4">
                    <h4 class="h4 underline">{name}</h4>
                    <p>{participants.length} Contestants</p>
                    <code class="code text-[xx-small]">{mint}</code>
                </div>
            {/each}
        </div>
    {/if}
{:catch err}
    <ErrorAlert>{err}</ErrorAlert>
{/await}
