<script>
    import { get, init } from '$lib/wallet';
    import { onMount } from 'svelte';

    init();

    const anchor = get();
    onMount(async () => {
        try {
            await anchor.connect(true);
        } catch (err) {
            if (err instanceof Error && 'code' in err && typeof err.code === 'number' && err.code === 4001) return;
            throw err;
        }
    });
</script>

<slot />
