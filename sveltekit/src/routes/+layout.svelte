<script>
    import './app.css';
    import { AppShell, Toast, initializeStores, setInitialClassState } from '@skeletonlabs/skeleton';
    import SideBar from './SideBar.svelte';
    import { browser } from '$app/environment';
    import logo from '$lib/icons/icons-32.png';

    initializeStores();

    // HACK: Workaround for Skeleton not setting the dark mode for SPAs.
    if (browser) setInitialClassState();
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
