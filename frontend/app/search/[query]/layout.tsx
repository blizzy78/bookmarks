import * as API from '@/components/API'
import Entry from '@/components/Entry'
import QueryInput from '@/components/QueryInput'
import TagCloudSection from '@/components/TagCloudSection'
import clsx from 'clsx'
import { Suspense } from 'react'

export default function Layout({ params, children }: { params: { query?: string }; children: React.ReactNode }) {
  let query: string | undefined = params.query?.trim()
  if (query === '' || query === '_') {
    query = undefined
  }

  return (
    <>
      <section className="sticky top-0 z-10 bg-slate-800 py-5 sm:py-6 md:py-8">
        <QueryInput value={query ?? ''} error={false} />
      </section>

      <Suspense>
        <Search query={query} />
      </Suspense>

      {children}
    </>
  )
}

async function Search({ query }: { query?: string }) {
  if (!query) {
    return <TagCloudSection limit={30} />
  }

  const searchResult = await API.fetchSearch(query)
  if (searchResult.hits.length === 0) {
    return <section className="mt-1">Nothing found.</section>
  }

  return (
    <section
      className={clsx(
        'mt-1 flex flex-col gap-8',
        // prevent browser bug: sticky input section doesn't completely cover our contents
        'px-[1px]',
      )}
    >
      {searchResult.hits.map((h) => (
        <Entry key={h.id} hit={h} />
      ))}
    </section>
  )
}
