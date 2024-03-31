<script>
    import { AppRail, AppRailAnchor, LightSwitch } from '@skeletonlabs/skeleton';
    import { Banknotes, Home, Trophy } from '@steeze-ui/heroicons';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { page } from '$app/stores';
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
    <AppRailAnchor href="/contests/" selected={pathname.startsWith('/contests/')}>
        <Icon src={Trophy} slot="lead" class="size-8" />
        <span>Contests</span>
    </AppRailAnchor>
    <AppRailAnchor href="/mint/" selected={pathname.startsWith('/mint/')}>
        <Icon src={Banknotes} slot="lead" class="size-8" />
        <span>Mint</span>
    </AppRailAnchor>
</AppRail>
