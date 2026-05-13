import type { MDXComponents } from 'mdx/types'

const components: MDXComponents = {
  code: ({ className, ...props }) => (
    <code
      className={`font-mono rounded bg-[color:var(--fg)]/10 px-1 py-0.5 text-[0.9em] ${className ?? ''}`}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={`font-mono overflow-x-auto rounded-md bg-[color:var(--fg)]/10 p-4 text-sm ${className ?? ''}`}
      {...props}
    />
  ),
}

export function useMDXComponents(): MDXComponents {
  return components
}