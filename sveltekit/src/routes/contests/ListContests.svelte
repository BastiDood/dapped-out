<script lang="ts">
    import CreateContest from './CreateContest.svelte';
    import type { Dapped } from '$lib/program';
    import ErrorAlert from '$lib/alerts/Error.svelte';
    import { ProgressBar } from '@skeletonlabs/skeleton';
    import WarningAlert from '$lib/alerts/Warning.svelte';
    // eslint-disable-next-line init-declarations
    export let program: Dapped;
</script>

<div class="space-y-4">
    <CreateContest {program} />
    {#await program.fetchContests()}
        <ProgressBar />
    {:then contests}
        {#if contests.length === 0}
            <WarningAlert>There are no contests yet.</WarningAlert>
        {/if}
    {:catch err}
        <ErrorAlert>{err}</ErrorAlert>
    {/await}
</div>
