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
    <hr class="!border-t-2" />
    {#await program.fetchContests()}
        <ProgressBar />
    {:then contests}
        {#if contests.length === 0}
            <WarningAlert>There are no contests yet.</WarningAlert>
        {:else}
            <div class="grid grid-cols-[repeat(auto-fill,minmax(30ch,1fr))]">
                {#each contests as { account: { slug, name, mint, stake, participants } }}
                    {@const total = stake.toNumber() * participants.length}
                    <a href="/contests/{slug}/" class="group card card-hover p-4">
                        <h4 class="h4"><span class="group-hover:anchor group-hover:underline">{name}</span></h4>
                        <p>{total} staked across {participants.length} contestants.</p>
                        <code class="code text-[xx-small]">{mint}</code>
                    </a>
                {/each}
            </div>
        {/if}
    {:catch err}
        <ErrorAlert>{err}</ErrorAlert>
    {/await}
</div>
