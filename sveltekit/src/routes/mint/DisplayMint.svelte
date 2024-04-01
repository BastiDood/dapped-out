<script lang="ts">
    import { web3 } from '@coral-xyz/anchor';
    // eslint-disable-next-line init-declarations
    export let address: web3.PublicKey;
    // eslint-disable-next-line init-declarations
    export let decimals: number;
    // eslint-disable-next-line init-declarations
    export let supply: bigint;
    export let mintAuthority = null as web3.PublicKey | null;
    export let freezeAuthority = null as web3.PublicKey | null;
</script>

<div class="table-container">
    <table class="table table-hover table-compact">
        <tbody>
            <tr>
                <th scope="row">Address</th>
                <td><code class="code">{address}</code></td>
            </tr>
            <tr>
                <th scope="row">Decimals</th>
                <td>{decimals}</td>
            </tr>
            <tr>
                <th scope="row">Supply</th>
                <td>{supply}</td>
            </tr>
            {#if mintAuthority !== null}
                <tr>
                    <th scope="row">Mint Authority</th>
                    <td><code class="code">{mintAuthority}</code></td>
                </tr>
            {/if}
            {#if freezeAuthority !== null}
                <tr>
                    <th scope="row">Freeze Authority</th>
                    <td><code class="code">{freezeAuthority}</code></td>
                </tr>
            {/if}
        </tbody>
    </table>
</div>
