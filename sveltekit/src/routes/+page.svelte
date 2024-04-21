<script lang="ts">
    import ConnectWalletButton from '$lib/components/ConnectWalletButton.svelte';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { Link } from '@steeze-ui/heroicons';
    import { MarkGithub } from '@steeze-ui/octicons';
</script>

<article class="prose max-w-none dark:prose-invert">
    <h1>Dapped Out!</h1>
    <ConnectWalletButton />
    <a href="https://github.com/BastiDood/dapped-out" target="_blank" class="variant-filled-primary btn">
        <Icon src={MarkGithub} theme="mini" class="size-6" />
        <span>BastiDood/dapped-out</span>
    </a>
    <a href="https://dapped-out.pages.dev" target="_blank" class="variant-filled-primary btn">
        <Icon src={Link} theme="mini" class="size-6" />
        <span>dapped-out.pages.dev</span>
    </a>
    <p>
        <em>Dapped Out!</em> is a timing-based casino game for the Solana blockchain, implemented as an installable
        <a href="https://web.dev/explore/progressive-web-apps" target="_blank" class="anchor"
            >progressive web application</a
        >. The objective of the game is simple: try to press a button as close to a targeted marker as possible. The
        closest contestant to the target wins the greatest share in the contested pot.
    </p>
    <p>
        The application accepts any valid token in the Solana blockchain as a currency for contests. When creating a new
        contest, simply point it to the mint account of the token being transacted. For instance, the <code
            class="not-prose code">USDC</code
        >
        coin may be transacted by pointing the contest to the mint address
        <code class="not-prose code">EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v</code>. For convenience, it is also
        possible to create (only) one brand new program-derived user-generated token instead. The creator has the
        privilege of minting new supply as well as transferring tokens to other wallets.
    </p>
    <p>
        Users may now join the existing contest by staking some tokens into the shared pot. As mentioned earlier, they
        now try their luck in timing the meter as closely as possible. At any point in the future, the contest host may
        close the contest to finally distribute the winnings in proportion to the accuracy of each contestant. Past
        contests are archived for future audits.
    </p>
</article>
