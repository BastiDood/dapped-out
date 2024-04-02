<script lang="ts">
    import type { BN, web3 } from '@coral-xyz/anchor';
    import { Clock, HandRaised } from '@steeze-ui/heroicons';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { onDestroy } from 'svelte';

    export let min = 0;
    export let value = min;
    // eslint-disable-next-line init-declarations
    export let max: number;

    // eslint-disable-next-line init-declarations
    export let name: string;
    // eslint-disable-next-line init-declarations
    export let id: string;
    // eslint-disable-next-line init-declarations
    export let targets: { token: web3.PublicKey; delay: BN }[];

    let handle = null as number | null;
    onDestroy(() => {
        if (handle === null) return;
        cancelAnimationFrame(handle);
        handle = null;
    });

    $: duration = max - min;

    function start() {
        let start = null as number | null;
        // eslint-disable-next-line no-undef
        return function render(ms: DOMHighResTimeStamp) {
            start ??= ms;
            const diff = ms - start;
            [handle, value] = diff < duration ? [requestAnimationFrame(render), diff] : [null, duration];
        };
    }

    $: [src, variant] =
        handle === null ? [Clock, 'variant-filled-secondary' as const] : [HandRaised, 'variant-filled-error' as const];
    function toggle() {
        handle = handle === null ? requestAnimationFrame(start()) : (cancelAnimationFrame(handle), null);
    }
</script>

<label class="label">
    <span><slot /></span>
    <div class="input-group input-group-divider grid-cols-[1fr_auto] gap-2 p-2">
        <input required disabled type="range" {min} {max} {value} {name} list={id} class="input px-4 py-2" />
        <datalist {id}>
            {#each targets as { token, delay }}
                {@const value = delay.toNumber()}
                <option {value}>{token}</option>
            {/each}
        </datalist>
        <button type="submit" class="{variant} btn-icon-md btn-icon !p-2" on:click={toggle}>
            <Icon {src} theme="mini" />
        </button>
    </div>
</label>
