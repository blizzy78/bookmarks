import * as Mantine from '@mantine/core'
import * as MantineForm from '@mantine/form'
import { useEffect, useRef, useState } from 'react'
import * as API from './API'
import tailwindConfig from './tailwindConfig'

export type BookmarkFormData = {
  url: string
  title: string
  description: string
  tags: string[]
}

export const BookmarkForm = ({
  objectID,
  onSave,
  onClose,
  onDelete,
}: {
  objectID?: string
  onSave(values: BookmarkFormData): void
  onClose(): void
  onDelete(): void
}) => {
  const form = MantineForm.useForm<BookmarkFormData>({
    initialValues: {
      url: '',
      title: '',
      description: '',
      tags: [],
    },

    validate: {
      url: (value) => (value === '' ? 'URL is required' : null),
      title: (value) => (value === '' ? 'Title is required' : null),
    },
  })

  const [tags, setTags] = useState<Mantine.SelectItem[]>([])

  const { data: allTags, isFetching: allTagsFetching } = API.useAllTags()

  useEffect(() => {
    if (!allTags) {
      setTags([])
      return
    }

    setTags(allTags.map((t) => ({ value: t, label: t })))
  }, [allTags])

  const { data: bookmark, isFetching } = API.useBookmark(objectID)
  const bookmarkLoaded = useRef(false)

  useEffect(() => {
    if (bookmarkLoaded.current) {
      return
    }

    if (!bookmark) {
      return
    }

    form.setValues({
      url: bookmark.url,
      title: bookmark.title,
      description: bookmark.description,
      tags: bookmark.tags,
    })

    bookmarkLoaded.current = true
  }, [bookmark, form])

  const onCreateTag = (t: string) => {
    const tag = { value: t, label: t }
    setTags((tags) => [...tags, tag])
    return tag
  }

  return (
    <form onSubmit={form.onSubmit(onSave)} className="relative flex flex-col gap-10">
      <Mantine.LoadingOverlay
        visible={allTagsFetching || (!!objectID && isFetching)}
        overlayColor={tailwindConfig.colors['slate-700']}
      />

      <div className="flex flex-col gap-5">
        <Mantine.TextInput
          label="URL"
          withAsterisk
          {...form.getInputProps('url')}
          classNames={{
            root: 'flex flex-col gap-1 !font-inherit !leading-none',
            label: '!text-base !font-normal dark:!text-inherit',
            required: '!text-inherit',
            input:
              '!rounded !border !font-inherit !text-base !transition-none dark:!border-slate-500 dark:!bg-slate-600 dark:!text-inherit dark:focus:!border-indigo-300',
          }}
        />

        <Mantine.TextInput
          label="Title"
          withAsterisk
          {...form.getInputProps('title')}
          classNames={{
            root: 'flex flex-col gap-1 !font-inherit !leading-none',
            label: '!text-base !font-normal dark:!text-inherit',
            required: '!text-inherit',
            input:
              '!rounded !border !font-inherit !text-base !transition-none dark:!border-slate-500 dark:!bg-slate-600 dark:!text-inherit dark:focus:!border-indigo-300',
          }}
        />

        <Mantine.Textarea
          label="Description"
          autosize
          minRows={3}
          {...form.getInputProps('description')}
          classNames={{
            root: 'flex flex-col gap-1 !font-inherit !leading-none',
            label: '!text-base !font-normal dark:!text-inherit',
            required: '!text-inherit',
            input:
              '!rounded !border !font-inherit !text-base !transition-none dark:!border-slate-500 dark:!bg-slate-600 dark:!text-inherit dark:focus:!border-indigo-300',
          }}
        />

        <Mantine.MultiSelect
          label="Tags"
          data={tags}
          searchable
          {...form.getInputProps('tags')}
          creatable
          getCreateLabel={(q) => `+ ${q}`}
          onCreate={onCreateTag}
          classNames={{
            root: 'flex flex-col gap-1 !font-inherit !leading-none',
            label: '!text-base !font-normal dark:!text-inherit',
            input:
              '!rounded !border !font-inherit !text-base !transition-none dark:!border-slate-500 dark:!bg-slate-600 dark:!text-inherit dark:focus-within:!border-indigo-300',
            defaultValue:
              '!rounded-full !border !font-normal dark:!border-slate-400 dark:!bg-slate-500 dark:!text-inherit',
            defaultValueLabel: '!font-inherit !text-sm dark:!text-slate-50',
            defaultValueRemove: 'dark:[&_*]:!fill-slate-50',
            searchInput: '!font-inherit !text-base !text-inherit focus:!outline-none',
            rightSection: 'dark:[&_*]:!fill-slate-300',
            dropdown:
              'dark:!rounded dark:!border dark:!border-slate-400 dark:!bg-slate-600 dark:hover:[&_.mantine-ScrollArea-scrollbar]:!bg-slate-500 dark:[&_.mantine-ScrollArea-thumb]:!bg-slate-300',
            item: '!font-inherit !text-inherit dark:data-[hovered=true]:!bg-slate-500',
          }}
        />
      </div>

      <div className="flex flex-row justify-end gap-3">
        {objectID && (
          <Mantine.Button
            type="button"
            onClick={onDelete}
            className="!rounded !border-transparent !font-inherit !text-base !font-normal active:!translate-y-0 dark:!text-inherit dark:hover:!bg-slate-600 dark:hover:!text-slate-50 dark:focus:!outline-indigo-300"
          >
            Delete
          </Mantine.Button>
        )}

        <Mantine.Button
          type="submit"
          disabled={!form.isValid()}
          className="!rounded !border !font-inherit !text-base !font-normal active:!translate-y-0 dark:!border-indigo-700 dark:!bg-indigo-700 dark:!text-indigo-100 dark:hover:!border-indigo-600 dark:hover:!bg-indigo-600 dark:hover:!text-indigo-50 dark:focus:!outline-indigo-300 dark:disabled:!border-indigo-700 dark:disabled:!bg-indigo-700 dark:disabled:!text-indigo-400"
        >
          Save
        </Mantine.Button>

        <Mantine.Button
          type="button"
          onClick={onClose}
          className="!rounded !border !font-inherit !text-base !font-normal active:!translate-y-0 dark:!border-slate-600 dark:!text-inherit dark:hover:!bg-slate-600 dark:hover:!text-slate-50 dark:focus:!outline-indigo-300"
        >
          Cancel
        </Mantine.Button>
      </div>
    </form>
  )
}
