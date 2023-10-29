'use client'

import clsx from 'clsx'
import * as ReactTagCloud from 'react-tagcloud'

export type TagCloudEntry = {
  key: string
  value: string
  count: number
}

export default function TagCloud_Client({ tags }: { tags: TagCloudEntry[] }) {
  const render = (tag: TagCloudEntry, size: number) => (
    <div
      key={tag.value}
      className={clsx(
        'self-center leading-none',
        size >= 4 ? 'dark:text-slate-300' : size >= 2 ? 'dark:text-slate-400' : 'dark:text-slate-500',
      )}
      style={{ fontSize: `${size}rem` }}
    >
      {tag.value}
    </div>
  )

  return (
    <ReactTagCloud.TagCloud
      className="flex flex-row flex-wrap justify-center gap-2"
      minSize={1}
      maxSize={5}
      tags={tags}
      renderer={render}
      disableRandomColor
    />
  )
}
