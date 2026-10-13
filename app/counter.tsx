"use client";

import { useState } from "react";

/**
 * A component the React Compiler memoizes. In development the Babel plugin
 * integration names the memoized anonymous functions after their owner
 * (`"Counter[onClick]"`, `"Counter[(anonymous)()]"`), the compiler's
 * `enableNameAnonymousFunctions` option; the native Turbopack path does not.
 */
export function Counter({ step }: { step: number }) {
  const [count, setCount] = useState(0);
  const onClick = () => setCount(count + step);
  const items = [1, 2, 3].map((x) => x * step);
  return (
    <button type="button" onClick={onClick}>
      {count} {items.join(",")}
    </button>
  );
}
