import '@fontsource/lato'
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

const queryClient = new ReactQuery.QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})

const mantineTheme: Mantine.MantineThemeOverride = {
  colorScheme: 'dark',
  fontFamily: 'Lato',

  colors: {
    dark: [
      '#e2e8f0',
      '#ff00ff',
      '#ff00ff',
      '#94a3b8',
      '#94a3b8',
      '#475569',
      '#334155',
      '#334155',
      '#475569',
      '#0f172a'
    ]
  }
}

const emotionCache = Mantine.createEmotionCache({
  key: 'mantine',
  prepend: false
})

export const App = (): JSX.Element => (
  <ReactQuery.QueryClientProvider client={queryClient}>
    <Mantine.MantineProvider theme={mantineTheme} emotionCache={emotionCache}>
      <MantineNotifications.NotificationsProvider position="bottom-left">
        <AppContents/>
      </MantineNotifications.NotificationsProvider>
    </Mantine.MantineProvider>
  </ReactQuery.QueryClientProvider>
)

const AppContents = (): JSX.Element => {
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
      id: type === 'save' ? (editingBookmarkID?.id ? 'bookmark.save.' + editingBookmarkID?.id : 'bookmark.create') : 'bookmark.delete.' + editingBookmarkID?.id,
      loading: status === 'working',
      message: type === 'save' ? (status === 'working' ? 'Saving bookmark' : 'Bookmark saved') : (status === 'working' ? 'Deleting bookmark' : 'Bookmark deleted'),
      color: status === 'working' ? undefined : 'teal',
      icon: status === 'done' && <FontAwesome.FontAwesomeIcon icon={FontAwesomeSolid.faCheck}/>,
      autoClose: status === 'working' ? false : 3000,
      disallowClose: true
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
          ...values
        },

        onCreating: () => showNotification('save', 'working'),
        onCreated: () => showNotification('save', 'done')
      })

      onEditorClose()

      return false
    }

    createBookmark({
      bookmark: {
        objectID: undefined,
        ...values
      },

      onCreating: () => showNotification('save', 'working'),
      onCreated: () => showNotification('save', 'done')
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
      onDeleted: () => showNotification('delete', 'done')
    })

    onEditorClose()
  }

  return <>
    <main className="flex flex-col mb-20">
      <section className="py-10 bg-slate-800 sticky top-0 z-10">
        <div className="container xl:max-w-screen-lg mx-auto flex flex-row gap-3">
          <Mantine.TextInput className="flex-grow" placeholder="Enter search query" radius="md" size="md" autoFocus
            value={query} onChange={e => setQuery(e.currentTarget.value)}
            error={isError || result?.error}/>

          <Mantine.Button className="flex-shrink dark:text-slate-200" radius="md" size="md" variant="default" onClick={onAddClick}>
            Add
          </Mantine.Button>
        </div>
      </section>

      {
        (!result && !isFetching && !isError) &&
        <section className="max-w-screen-sm mx-auto mt-20">
          <TagCloud limit={30}/>
        </section>
      }

      {
        (!!result && result.hits.length === 0) &&
        <section className="container xl:max-w-screen-lg mx-auto">
          <p>
            Nothing found.
          </p>
        </section>
      }

      {
        (!!result && result.hits.length > 0) &&
        <section className="container xl:max-w-screen-lg mx-auto flex flex-col gap-8">
          {
            result.hits.map((h, idx) => (
              <Entry key={idx} hit={h} onEditClick={() => onEditClick(h.id)}/>
            ))
          }
        </section>
      }
    </main>

    <BookmarkEditor bookmarkID={editingBookmarkID} onSave={onEditorSave} onClose={onEditorClose} onDelete={onEditorDelete}/>

    {
      import.meta.env.DEV &&
      <BreakpointReadout className="fixed right-2 top-2 opacity-80 z-50"/>
    }
  </>
}

const BookmarkEditor = ({ bookmarkID, onSave, onClose, onDelete }: {
    bookmarkID: { id: string | undefined} | undefined
    onSave(values: BookmarkFormData): boolean
    onClose(): void
    onDelete(): void
  }): JSX.Element => {

  return (
    <Mantine.Drawer size="xl" padding="lg"
    title={
      <h2 className="text-lg font-semibold">
        {bookmarkID?.id ? 'Edit Bookmark' : 'Add Bookmark'}
      </h2>
    }
    opened={!!bookmarkID} onClose={onClose}>

      {
        !!bookmarkID && <BookmarkForm objectID={bookmarkID.id} onSave={onSave} onClose={onClose} onDelete={onDelete}/>
      }
    </Mantine.Drawer>
  )
}

interface TagCloudEntry {
  key: string
  value: string
  count: number
}

const TagCloud = ({ limit }: { limit: number }): JSX.Element | null => {
  const { data } = API.useAllTagCounts()

  if (!data) {
    return null
  }

  const tags: TagCloudEntry[] = Object.keys(data)
    .map(t => ({ key: t, value: t, count: data[t] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)

  return (
    <ReactTagCloud.TagCloud className="flex flex-row justify-center flex-wrap gap-2"
      minSize={1} maxSize={5} tags={tags} renderer={tagCloudTag} disableRandomColor/>
  )
}

const tagCloudTag = (tag: TagCloudEntry, size: number): JSX.Element => {
  return (
    <div key={tag.value} className={classNames('self-center leading-none', size >= 2 ? 'dark:text-slate-400' : 'dark:text-slate-500')}
      style={{ fontSize: `${size}rem` }}>

      {tag.value}
    </div>
  )
}
