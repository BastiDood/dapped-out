<script lang="ts">
    import type { BN, web3 } from '@coral-xyz/anchor';

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
    </div>
</label>
