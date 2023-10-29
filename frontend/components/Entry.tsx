import * as APISchema from './APISchema'
import EntryEditButton_Client from './EntryEditButton'
import Tags from './Tags'

export default function Entry({ hit /*onEditClick*/ }: { hit: APISchema.Hit /*onEditClick(): void*/ }) {
  // const prefetchBookmark = API.usePrefetchBookmark()

  // // prefetch bookmark so that the editor opens faster
  // const onEditMouseEnter = () => prefetchBookmark(hit.id)

  return (
    <div className="flex flex-col items-start gap-2">
      <a
        className="w-full truncate text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 dark:text-slate-400 dark:hover:text-slate-300"
        href={hit.url}
        rel="noreferrer noopener"
        dangerouslySetInnerHTML={{ __html: hit.urlHTML }}
      />

      <div className="flex flex-col gap-1">
        <h3 className="flex flex-row items-center gap-3 text-lg font-semibold">
          <a
            className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 dark:hover:text-slate-50"
            href={hit.url}
            rel="noreferrer noopener"
            dangerouslySetInnerHTML={{ __html: hit.titleHTML }}
          />

          <EntryEditButton_Client objectID={hit.id} />
        </h3>

        {hit.descriptionHTML !== '' && <p dangerouslySetInnerHTML={{ __html: hit.descriptionHTML }} />}
      </div>

      {hit.tags && hit.tags.length > 0 && <Tags tags={hit.tags} />}
    </div>
  )
}
