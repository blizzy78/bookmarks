import clsx from 'clsx'
import * as ReactTagCloud from 'react-tagcloud'
import * as API from './API'

interface TagCloudEntry {
  key: string
  value: string
  count: number
}

export default function TagCloud({ limit }: { limit: number }) {
  const { data } = API.useAllTagCounts()
  if (!data) {
    return null
  }

  const tags = Object.keys(data)
    .map((t) => ({ key: t, value: t, count: data[t] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)

  const render = (tag: TagCloudEntry, size: number) => (
    <div
      key={tag.value}
      className={clsx(
        'self-center leading-none',
        size >= 4 ? 'dark:text-slate-300' : size >= 2 ? 'dark:text-slate-400' : 'dark:text-slate-500'
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