<script lang="ts">
    import { DappedContest } from '$lib/program';
    import ErrorAlert from '$lib/alerts/Error.svelte';
    import { ProgressBar } from '@skeletonlabs/skeleton';
    // eslint-disable-next-line init-declarations
    export let program: DappedContest;
</script>

{#await program.fetch()}
    <ProgressBar />
{:then { name }}
    <p>{name}</p>
{:catch err}
    <ErrorAlert>{err}</ErrorAlert>
{/await}
