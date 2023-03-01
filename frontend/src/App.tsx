import '@fontsource/roboto-condensed'
import '@fontsource/roboto-flex'
import * as FontAwesomeSolid from '@fortawesome/free-solid-svg-icons'
import * as FontAwesome from '@fortawesome/react-fontawesome'
import * as Mantine from '@mantine/core'
import * as MantineHooks from '@mantine/hooks'
import * as MantineNotifications from '@mantine/notifications'
import * as ReactQuery from '@tanstack/react-query'
import classNames from 'classnames'
import { useState } from 'react'
import * as ReactTagCloud from 'react-tagcloud'
import * as API from './API'
import { BreakpointReadout } from './BreakpointReadout'
import { BookmarkForm, BookmarkFormData } from './EditBookmark'
import { Entry } from './Entry'
import './index.css'

interface TagCloudEntry {
  key: string
  value: string
  count: number
}

const queryClient = API.createQueryClient()

export const App = () => (
  <ReactQuery.QueryClientProvider client={queryClient}>
    <MantineNotifications.NotificationsProvider position="bottom-left">
      <AppContents />
    </MantineNotifications.NotificationsProvider>
  </ReactQuery.QueryClientProvider>
)

const AppContents = () => {
  const [query, setQuery] = useState('')
  const [debouncedQuery] = MantineHooks.useDebouncedValue(query, 350)

  const { data: result, isFetching, isError } = API.useSearch(debouncedQuery)

  const [editingBookmarkID, setEditingBookmarkID] = useState<{ id: string | undefined } | undefined>(undefined)

  const onAddClick = () => setEditingBookmarkID({ id: undefined })
  const onEditClick = (id: string) => setEditingBookmarkID({ id: id })
  const onEditorClose = () => setEditingBookmarkID(undefined)

  const createBookmark = API.useCreateBookmark()
  const updateBookmark = API.useUpdateBookmark()

  const showNotification = (type: 'save' | 'delete', status: 'working' | 'done') => {
    const data: MantineNotifications.NotificationProps & { id: string } = {
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
      disallowClose: true,

      classNames: {
        root: '!rounded-lg dark:!bg-slate-600 dark:!border-slate-400',
        description: '!font-inherit !text-base dark:!text-inherit',
        icon: status === 'done' ? '!bg-green-600 !color-white' : undefined,
      },
    }

    if (status === 'working') {
      MantineNotifications.showNotification(data)
      return
    }

    MantineNotifications.updateNotification(data)
  }

  const onEditorSave = (values: BookmarkFormData) => {
    if (editingBookmarkID?.id) {
      updateBookmark({
        bookmark: {
          objectID: editingBookmarkID?.id,
          ...values,
        },

        onCreating: () => showNotification('save', 'working'),
        onCreated: () => showNotification('save', 'done'),
      })

      onEditorClose()

      return false
    }

    createBookmark({
      bookmark: {
        objectID: undefined,
        ...values,
      },

      onCreating: () => showNotification('save', 'working'),
      onCreated: () => showNotification('save', 'done'),
    })

    return true
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
      <main className="mx-auto mb-20 flex flex-col px-5 lg:max-w-screen-lg xl:px-0">
        <section className="sticky top-0 z-10 bg-slate-800 py-5 sm:py-6 md:py-8">
          <div className="grid grid-cols-[1fr_max-content] items-stretch">
            <Mantine.TextInput
              placeholder="Enter search query"
              radius="md"
              size="md"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              error={isError || result?.error}
              classNames={{
                root: '!font-inherit',
                input:
                  '!rounded-l-full !rounded-r-none !font-inherit !text-base md:!text-lg dark:!bg-slate-700 !border dark:!border-slate-400 dark:!text-inherit dark:focus:!border-indigo-300 !transition-none',
              }}
            />

            <Mantine.Button
              className="h-full !rounded-l-none !rounded-r-full !border-l-0 !border-t !border-b !border-r !pl-3 !pr-4 !font-inherit text-base !font-normal active:!translate-y-0 dark:border-slate-400 dark:!bg-slate-700 dark:text-inherit dark:hover:!bg-slate-600 dark:hover:text-slate-50 dark:focus:!outline-indigo-300 md:text-lg"
              onClick={onAddClick}
            >
              Create
            </Mantine.Button>
          </div>
        </section>

        {!result && !isFetching && !isError && (
          <section className="mx-auto mt-20 max-w-screen-sm">
            <TagCloud limit={30} />
          </section>
        )}

        {!!result && result.hits.length === 0 && (
          <section>
            <p>Nothing found.</p>
          </section>
        )}

        {!!result && result.hits.length > 0 && (
          <section className="mt-1 flex flex-col gap-8">
            {result.hits.map((h, idx) => (
              <Entry key={idx} hit={h} onEditClick={() => onEditClick(h.id)} />
            ))}
          </section>
        )}
      </main>

      <BookmarkEditor
        bookmarkID={editingBookmarkID}
        onSave={onEditorSave}
        onClose={onEditorClose}
        onDelete={onEditorDelete}
      />

      {import.meta.env.DEV && <BreakpointReadout className="fixed right-2 top-2 z-50 opacity-80" />}
    </>
  )
}

const BookmarkEditor = ({
  bookmarkID,
  onSave,
  onClose,
  onDelete,
}: {
  bookmarkID: { id: string | undefined } | undefined
  onSave(values: BookmarkFormData): boolean
  onClose(): void
  onDelete(): void
}) => (
  <Mantine.Drawer
    size="xl"
    padding="lg"
    title={<h2 className="text-xl font-semibold">{bookmarkID?.id ? 'Edit Bookmark' : 'Add Bookmark'}</h2>}
    opened={!!bookmarkID}
    onClose={onClose}
    classNames={{
      overlay: '!bg-slate-900 !opacity-60',
      drawer: 'dark:!bg-slate-700 dark:!text-inherit flex flex-col gap-5',
      header: '!mb-0',
      title: '!font-roboto-condensed',
      closeButton:
        'active:!translate-y-0 dark:hover:!bg-slate-600 dark:[&_*]:!fill-slate-300 dark:[&_*]:hover:!fill-slate-50 dark:focus:!outline-indigo-300',
    }}
    transitionDuration={0}
  >
    {!!bookmarkID && <BookmarkForm objectID={bookmarkID.id} onSave={onSave} onClose={onClose} onDelete={onDelete} />}
  </Mantine.Drawer>
)

const TagCloud = ({ limit }: { limit: number }) => {
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
      className={classNames(
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
