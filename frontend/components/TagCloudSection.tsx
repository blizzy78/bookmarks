import { Suspense } from 'react'
import * as API from './API'
import TagCloud, { TagCloudEntry } from './TagCloud'

export default function TagCloudSection({ limit }: { limit: number }) {
  return (
    <Suspense>
      <CloudSection limit={limit} />
    </Suspense>
  )
}

async function CloudSection({ limit }: { limit: number }) {
  try {
    const tagCounts = await API.fetchTagCounts()

    const tags = Object.keys(tagCounts)
      .map((t) => ({ key: t, value: t, count: tagCounts[t] }) satisfies TagCloudEntry)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

    return (
      <section className="mx-auto mt-20 max-w-screen-sm">
        <TagCloud tags={tags} />
      </section>
    )
  } catch {
    return null
  }
}
