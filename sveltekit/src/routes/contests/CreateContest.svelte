<script lang="ts">
    import { type Dapped, DappedContest } from '$lib/program';
    import { validateFormInteger, validateFormString } from '$lib/form';
    import BN from 'bn.js';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { PlusCircle } from '@steeze-ui/heroicons';
    import { assert } from '$lib/assert';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { goto } from '$app/navigation';

    // eslint-disable-next-line init-declarations
    export let program: Dapped;

    const toast = getToastStore();
    async function submit(form: HTMLFormElement, button: HTMLElement | null) {
        assert(button !== null, 'submitter is null');
        assert(button instanceof HTMLButtonElement, 'submitter is not a button');
        button.disabled = true;
        try {
            const data = new FormData(form);
            const slug = validateFormString(data.get('slug'));
            const name = validateFormString(data.get('name'));
            const stake = new BN(validateFormInteger(data.get('stake')));
            const delay = new BN(validateFormInteger(data.get('delay')));
            const offset = validateFormInteger(data.get('offset'));
            const dapped = new DappedContest(program, slug);
            await dapped.createContest(name, stake, delay, offset);
            await goto(`/contests/${slug}/`);
        } catch (err) {
            if (err instanceof Error)
                toast.trigger({
                    message: err.message,
                    background: 'variant-filled-error',
                });
            console.error(err);
            throw err;
        } finally {
            // eslint-disable-next-line require-atomic-updates
            button.disabled = false;
        }
    }
</script>

<form
    on:submit|self|preventDefault|stopPropagation={({ currentTarget, submitter }) => submit(currentTarget, submitter)}
    class="space-y-4"
>
    <label class="label">
        <!-- TODO: This should be controlled by the spacebar. -->
        <span>Delay</span>
        <input required disabled type="range" min="0" max="5000" value="0" name="delay" class="input px-4 py-2" />
    </label>
    <label class="label">
        <span>Slug</span>
        <input
            required
            type="text"
            maxlength="16"
            pattern="[a-zA-Z0-9_\-]+"
            name="slug"
            placeholder="Slug"
            class="input px-4 py-2"
        />
    </label>
    <label class="label">
        <span>Name</span>
        <input required type="text" maxlength="16" name="name" placeholder="Name" class="input px-4 py-2" />
    </label>
    <label class="label">
        <span>Stake</span>
        <input required type="number" min="1" name="stake" placeholder="Stake" class="input px-4 py-2" />
    </label>
    <label class="label">
        <span>Offset</span>
        <input required type="number" min="1" name="offset" placeholder="Offset" class="input px-4 py-2" />
    </label>
    <button type="submit" class="variant-filled-success btn w-full">
        <Icon src={PlusCircle} theme="mini" class="size-8" />
        <span>Create Contest</span>
    </button>
</form>
