# `experimental.turbopackRustReactCompiler` drops options the Babel React Compiler path sets

Minimal reproduction for a vercel/next.js issue. One client component, `app/counter.tsx`, built with the React Compiler two ways:

- `npm run dev` — the Babel loader path (`babel-plugin-react-compiler`)
- `npm run dev:rust` — the native Turbopack path (`experimental.turbopackRustReactCompiler: true`)

`node scripts-show-compiled.mjs` (and `RUST_COMPILER=1 node scripts-show-compiled.mjs`) starts `next dev`, fetches the client chunk of `app/counter.tsx` and prints the compiled `Counter`.

Babel path (development):

```js
const $ = _c(11);
if ($[0] !== "5fc996b4…") {               // reset the memo cache when the source file changes (Fast Refresh)
  for (let $i = 0; $i < 11; $i += 1) $[$i] = Symbol.for("react.memo_cache_sentinel");
  $[0] = "5fc996b4…";
}
…
t1 = { "Counter[onClick]": () => setCount(count + step) }["Counter[onClick]"];   // named for DevTools / stack traces
t3 = t2.map({ "Counter[(anonymous)()]": (x) => x * step }["Counter[(anonymous)()]"]);
```

Native path (development):

```js
const $ = _c(10);                          // no source-hash guard
…
t1 = () => setCount(count + step);         // anonymous
t3 = t2.map((x) => x * step);
```

Fix on a fork: https://github.com/vercel/next.js/compare/canary...vjeux:next.js:react-compiler-native-parity?expand=1
