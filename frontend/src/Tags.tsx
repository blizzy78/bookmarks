import { ReactNode } from 'react'

export const Tags = ({ tags }: { tags: string[] }): JSX.Element => (
  <div className="flex flex-row gap-1">
    {
      tags.map(t =>
        <Tag key={t}>
          {t}
        </Tag>
      )
    }
  </div>
)

const Tag = ({ children }: { children: ReactNode }) => (
  <div className="px-2 py-1 rounded border dark:border-slate-500 dark:bg-slate-600 text-xs">
    {children}
  </div>
)
