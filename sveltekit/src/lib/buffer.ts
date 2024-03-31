import { Buffer } from 'buffer/';
import { browser } from '$app/environment';

if (browser)
    // @ts-expect-error This is a polyfill for the Node.js module.
    window.Buffer = Buffer;
