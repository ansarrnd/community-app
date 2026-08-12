/** Firebase JS SDK (functions) expects `self` in Node/Jest */
if (typeof globalThis.self === 'undefined') {
  globalThis.self = globalThis;
}
