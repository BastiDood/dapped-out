<script lang="ts">
    import { Clock, HandRaised } from '@steeze-ui/heroicons';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { onDestroy } from 'svelte';

    // eslint-disable-next-line init-declarations
    export let name: string;
    export let min = 0;
    export let value = min;
    // eslint-disable-next-line init-declarations
    export let max: number;

    let id = null as number | null;
    onDestroy(() => {
        if (id === null) return;
        cancelAnimationFrame(id);
        id = null;
    });

    $: duration = max - min;
    function start() {
        let start = null as number | null;
        // eslint-disable-next-line no-undef
        return function render(ms: DOMHighResTimeStamp) {
            start ??= ms;
            const diff = ms - start;
            [id, value] = diff < duration ? [requestAnimationFrame(render), diff] : [null, duration];
        };
    }

    $: [src, variant] = id === null ? [Clock, 'variant-filled-secondary'] : [HandRaised, 'variant-filled-error'];
    function toggle() {
        if (id === null) id = requestAnimationFrame(start());
        else {
            cancelAnimationFrame(id);
            id = null;
        }
    }
</script>

<label class="label">
    <span><slot /></span>
    <div class="input-group input-group-divider grid-cols-[1fr_auto] gap-2 p-2">
        <input required disabled type="range" {min} {max} {value} {name} class="input px-4 py-2" />
        <button type="button" class="{variant} btn-icon-md btn-icon !p-2" on:click={toggle}>
            <Icon {src} theme="mini" />
        </button>
    </div>
</label>
