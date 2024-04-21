<script>
    import { AppRail, AppRailAnchor, LightSwitch } from '@skeletonlabs/skeleton';
    import { ArchiveBox, Banknotes, Home, Trophy } from '@steeze-ui/heroicons';
    import { Dapped } from '$lib/program';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { get } from '$lib/wallet';
    import { page } from '$app/stores';

    const wallet = get();
    $: show = $wallet instanceof Dapped;
    $: ({ pathname } = $page.url);
</script>

<AppRail width="w-20">
    <div slot="lead" class="my-4 flex items-center justify-center">
        <LightSwitch />
    </div>
    <AppRailAnchor href="/" selected={pathname === '/'}>
        <Icon src={Home} slot="lead" class="size-8" />
        <span>Home</span>
    </AppRailAnchor>
    {#if show}
        <AppRailAnchor href="/mint/" selected={pathname.startsWith('/mint/')}>
            <Icon src={Banknotes} slot="lead" class="size-8" />
            <span>Mint</span>
        </AppRailAnchor>
        <AppRailAnchor href="/contests/" selected={pathname.startsWith('/contests/')}>
            <Icon src={Trophy} slot="lead" class="size-8" />
            <span>Contests</span>
        </AppRailAnchor>
        <AppRailAnchor href="/archives/" selected={pathname.startsWith('/archives/')}>
            <Icon src={ArchiveBox} slot="lead" class="size-8" />
            <span>Archives</span>
        </AppRailAnchor>
    {/if}
</AppRail>
