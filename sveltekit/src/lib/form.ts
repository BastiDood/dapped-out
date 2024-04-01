import { assert } from '$lib/assert';
import { web3 } from '@coral-xyz/anchor';

type FormValue = ReturnType<FormData['get']>;

export function validateFormString(value: FormValue) {
    assert(value !== null, 'form value is null');
    if (value instanceof File) throw new Error('non-string form value');
    return value;
}

export function validateFormInteger(value: FormValue, radix = 10) {
    const str = validateFormString(value);
    return parseInt(str, radix);
}

export function validateFormPublicKey(value: FormValue) {
    const str = validateFormString(value);
    return new web3.PublicKey(str);
}
