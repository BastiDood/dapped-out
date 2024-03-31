<script lang="ts">
    import type { DappedProgram } from '$lib/wallet';
    // eslint-disable-next-line init-declarations
    export let program: DappedProgram;
</script>

<p>{program.programId}</p>
