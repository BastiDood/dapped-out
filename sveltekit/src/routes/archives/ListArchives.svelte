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
    {/if}
{:catch err}
    <ErrorAlert>{err}</ErrorAlert>
{/await}
