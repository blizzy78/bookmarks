import '@fontsource/roboto-condensed'
import '@fontsource/roboto-flex'
import * as FontAwesomeSolid from '@fortawesome/free-solid-svg-icons'
import * as FontAwesome from '@fortawesome/react-fontawesome'
import * as Mantine from '@mantine/core'
import * as MantineHooks from '@mantine/hooks'
import * as MantineNotifications from '@mantine/notifications'
import * as ReactQuery from '@tanstack/react-query'
import '@total-typescript/ts-reset'
import { Suspense, useState } from 'react'
import lazyWithPreload from 'react-lazy-with-preload'
import * as API from './API'
import { BreakpointReadout } from './BreakpointReadout'
import { BookmarkFormData } from './EditBookmark'
import './index.css'

const TagCloud = lazyWithPreload(() => import('./TagCloud'))
const Entry = lazyWithPreload(() => import('./Entry'))
const BookmarkEditor = lazyWithPreload(() => import('./BookmarkEditor'))
const Notifications = lazyWithPreload(() => import('./Notifications'))

const queryClient = API.createQueryClient()

export const App = () => (
  <ReactQuery.QueryClientProvider client={queryClient}>
    <AppContents />
  </ReactQuery.QueryClientProvider>
)

const AppContents = () => {
  const [query, setQuery] = useState('')
  const [debouncedQuery] = MantineHooks.useDebouncedValue(query, 350)

  const { data: searchResult, isFetching, isError } = API.useSearch(debouncedQuery)

  const [editingBookmarkID, setEditingBookmarkID] = useState<{ id?: string } | undefined>(undefined)

  const onAddClick = () => setEditingBookmarkID({})
  const onEditClick = (id: string) => setEditingBookmarkID({ id })
  const onEditorClose = () => setEditingBookmarkID(undefined)

  const createBookmark = API.useCreateBookmark()
  const updateBookmark = API.useUpdateBookmark()

  const showNotification = (type: 'save' | 'delete', status: 'working' | 'done') => {
    const data = {
      id:
        type === 'save'
          ? editingBookmarkID?.id
            ? 'bookmark.save.' + editingBookmarkID?.id
            : 'bookmark.create'
          : 'bookmark.delete.' + editingBookmarkID?.id,
      loading: status === 'working',
      message:
        type === 'save'
          ? status === 'working'
            ? 'Saving bookmark'
            : 'Bookmark saved'
          : status === 'working'
          ? 'Deleting bookmark'
          : 'Bookmark deleted',
      icon: status === 'done' && <FontAwesome.FontAwesomeIcon icon={FontAwesomeSolid.faCheck} />,
      autoClose: status === 'working' ? false : 3000,
      withCloseButton: false,

      classNames: {
        root: '!rounded-lg dark:!bg-slate-600 dark:!border-slate-400',
        description: '!font-inherit !text-base dark:!text-inherit',
        icon: status === 'done' ? '!bg-green-600 !color-white' : undefined,
      },
    } satisfies MantineNotifications.NotificationProps & { id: string }

    if (status === 'working') {
      MantineNotifications.showNotification(data)
      return
    }

    MantineNotifications.updateNotification(data)
  }

  const onEditorSave = (values: BookmarkFormData) => {
    const onCreating = () => showNotification('save', 'working')
    const onCreated = () => showNotification('save', 'done')

    if (!!editingBookmarkID?.id) {
      updateBookmark({
        bookmark: {
          ...values,
          objectID: editingBookmarkID?.id,
        },

        onCreating,
        onCreated,
      })
    } else {
      createBookmark({
        bookmark: {
          ...values,
          objectID: undefined,
        },

        onCreating,
        onCreated,
      })
    }

    onEditorClose()
  }

  const deleteBookmark = API.useDeleteBookmark()

  const onEditorDelete = () => {
    if (!confirm('Delete bookmark?')) {
      return
    }

    deleteBookmark({
      objectID: editingBookmarkID?.id as string,
      onDeleting: () => showNotification('delete', 'working'),
      onDeleted: () => showNotification('delete', 'done'),
    })

    onEditorClose()
  }

  return (
    <>
      <main className="isolate mx-auto mb-20 flex flex-col px-5 lg:max-w-screen-lg xl:px-0">
        <section className="sticky top-0 z-10 bg-slate-800 py-5 sm:py-6 md:py-8">
          <div className="grid grid-cols-[1fr_max-content] items-stretch">
            <Mantine.TextInput
              placeholder="Enter search query"
              radius="md"
              size="md"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              error={isError || searchResult?.error}
              classNames={{
                root: '!font-inherit',
                input:
                  '!rounded-l-full !rounded-r-none !border !font-inherit !text-base !transition-none dark:!border-slate-400 dark:!bg-slate-700 dark:!text-inherit dark:focus:!border-indigo-300 md:!text-lg',
              }}
            />

            <Mantine.Button
              className="h-full !rounded-l-none !rounded-r-full !border-b !border-l-0 !border-r !border-t !pl-3 !pr-4 !font-inherit text-base !font-normal active:!translate-y-0 dark:border-slate-400 dark:!bg-slate-700 dark:text-inherit dark:hover:!bg-slate-600 dark:hover:text-slate-50 dark:focus:!outline-indigo-300 md:text-lg"
              onClick={onAddClick}
            >
              Create
            </Mantine.Button>
          </div>
        </section>

        <Suspense>
          {!searchResult && !isFetching && !isError && (
            <section className="mx-auto mt-20 max-w-screen-sm">
              <TagCloud limit={30} />
            </section>
          )}

          {!!searchResult && searchResult.hits.length === 0 && (
            <section>
              <p>Nothing found.</p>
            </section>
          )}

          {!!searchResult && searchResult.hits.length > 0 && (
            <section className="mt-1 flex flex-col gap-8">
              {searchResult.hits.map((h, idx) => (
                <Entry key={idx} hit={h} onEditClick={() => onEditClick(h.id)} />
              ))}
            </section>
          )}
        </Suspense>
      </main>

      <Suspense>
        <BookmarkEditor
          bookmarkID={editingBookmarkID}
          onSave={onEditorSave}
          onClose={onEditorClose}
          onDelete={onEditorDelete}
        />

        <Notifications position="bottom-left" />
      </Suspense>

      {import.meta.env.DEV && <BreakpointReadout className="fixed right-2 top-2 opacity-80" />}
    </>
  )
}
