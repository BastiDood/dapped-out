<script lang="ts">
    import { Banknotes, CircleStack, Clock, User } from '@steeze-ui/heroicons';
    import type { Dapped } from '$lib/program';
    import ErrorAlert from '$lib/alerts/Error.svelte';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { ProgressBar } from '@skeletonlabs/skeleton';
    import WarningAlert from '$lib/alerts/Warning.svelte';
    import { BN } from 'bn.js';
    // eslint-disable-next-line init-declarations
    export let program: Dapped;
</script>

{#await program.fetchArchives()}
    <ProgressBar />
{:then archives}
    {#if archives.length === 0}
        <WarningAlert>There are no archives yet.</WarningAlert>
    {:else}
        <div class="grid grid-cols-[repeat(auto-fill,minmax(40ch,1fr))] text-sm">
            {#each archives as { account: { name, mint, token, stake, delay, offset, winnings } }}
                {@const expected = stake.muln(winnings.length + 1)}
                {@const total = winnings.reduce((prev, curr) => curr.reward.add(prev), new BN(0))}
                {@const deficit = expected.sub(total)}
                <div class="group card space-y-2 p-4">
                    <h4 class="h4 underline">{name}</h4>
                    <div class="grid auto-rows-min grid-cols-[auto_1fr] items-center gap-2">
                        <Icon src={Banknotes} theme="micro" class="size-6" />
                        <span>Using mint <code class="code align-middle text-[xx-small]">{mint}</code>.</span>
                        <Icon src={Banknotes} theme="micro" class="size-6" />
                        <span>Hosted by <code class="code align-middle text-[xx-small]">{token}</code>.</span>
                        <Icon src={CircleStack} theme="micro" class="size-6" />
                        <span>Must stake <code class="code align-middle">{stake}</code> tokens.</span>
                        <Icon src={Clock} theme="micro" class="size-6" />
                        <span
                            >Must aim for <code class="code align-middle">{delay}</code> &pm;
                            <code class="code">{offset}</code> milliseconds.</span
                        >
                        <Icon src={User} theme="micro" class="size-6" />
                        <span>Host retained <code class="code">{deficit}</code> tokens as residual.</span>
                        {#each winnings as { token, delay, reward }}
                            <Icon src={User} theme="micro" class="size-6" />
                            <span
                                >Rewarded <code class="code">{reward}</code> tokens to
                                <code class="code align-middle text-[xx-small]">{token}</code>
                                for <code class="code">{delay}</code>-millisecond attempt.</span
                            >
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
{:catch err}
    <ErrorAlert>{err}</ErrorAlert>
{/await}
