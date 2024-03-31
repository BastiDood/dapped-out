<script>
    import './app.css';
    import '$lib/buffer';
    import { AppShell, Toast, initializeStores, setInitialClassState } from '@skeletonlabs/skeleton';
    import { get, init } from '$lib/wallet';
    import SideBar from './SideBar.svelte';
    import { browser } from '$app/environment';
    import logo from '$lib/icons/icons-32.png';
    import { onMount } from 'svelte';

    init();
    initializeStores();

    // HACK: Workaround for Skeleton not setting the dark mode for SPAs.
    if (browser) setInitialClassState();

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

<svelte:head>
    <link rel="icon" href={logo} />
</svelte:head>

<Toast />
<AppShell>
    <SideBar slot="sidebarLeft" />
    <div class="p-4">
        <slot />
    </div>
</AppShell>
