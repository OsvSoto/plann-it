export const authStorage = typeof globalThis.localStorage === 'undefined'
  ? undefined
  : globalThis.localStorage
