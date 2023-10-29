import * as Mantine from '@mantine/core'
import * as MantineForm from '@mantine/form'
import { useState } from 'react'
import * as APISchema from './APISchema'

export type BookmarkFormData = {
  url: string
  title: string
  description: string
  tags: string[]
}

export default function BookmarkForm_Client({
  bookmark,
  allTags,
  onDelete,
  onSave,
  onClose,
}: {
  bookmark?: APISchema.Bookmark
  allTags: APISchema.TagsList
  onDelete?(): Promise<void>
  onSave(values: BookmarkFormData): Promise<void>
  onClose(): void
}) {
  const form = MantineForm.useForm<BookmarkFormData>({
    initialValues: {
      url: bookmark?.url ?? '',
      title: bookmark?.title ?? '',
      description: bookmark?.description ?? '',
      tags: bookmark?.tags ?? [],
    },

    validate: {
      url: (value) => (value === '' ? 'URL is required' : null),
      title: (value) => (value === '' ? 'Title is required' : null),
    },
  })

  const [pending, setPending] = useState(false)

  const [tags, setTags] = useState(allTags.map((t) => ({ value: t, label: t })))

  const onCreateTag = (t: string) => {
    const tag = { value: t, label: t }
    setTags((tags) => [...tags, tag])
    return tag
  }

  const onDeleteInternal = !!onDelete
    ? async () => {
        setPending(true)
        await onDelete()
      }
    : undefined

  const onSaveInternal = async (values: BookmarkFormData) => {
    setPending(true)
    await onSave(values)
  }

  return (
    <form onSubmit={form.onSubmit(onSaveInternal)} className="relative flex flex-col gap-10">
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
        {!!bookmark && !!onDeleteInternal && (
          <Mantine.Button
            type="button"
            disabled={pending}
            onClick={onDeleteInternal}
            className="!rounded !border-transparent !font-inherit !text-base !font-normal active:!translate-y-0 dark:!text-inherit dark:hover:!bg-slate-600 dark:hover:!text-slate-50 dark:focus:!outline-indigo-300 dark:disabled:bg-transparent dark:disabled:!text-slate-400"
          >
            Delete
          </Mantine.Button>
        )}

        <Mantine.Button
          type="submit"
          disabled={!form.isValid() || pending}
          className="!rounded !border !font-inherit !text-base !font-normal active:!translate-y-0 dark:!border-indigo-700 dark:!bg-indigo-700 dark:!text-indigo-100 dark:hover:!border-indigo-600 dark:hover:!bg-indigo-600 dark:hover:!text-indigo-50 dark:focus:!outline-indigo-300 dark:disabled:!border-indigo-700 dark:disabled:!bg-indigo-700 dark:disabled:!text-indigo-400"
        >
          Save
        </Mantine.Button>

        <Mantine.Button
          type="button"
          disabled={pending}
          onClick={onClose}
          className="!rounded !border !font-inherit !text-base !font-normal active:!translate-y-0 dark:!border-slate-500 dark:!text-inherit dark:hover:!bg-slate-600 dark:hover:!text-slate-50 dark:focus:!outline-indigo-300 dark:disabled:bg-transparent dark:disabled:!text-slate-400"
        >
          Cancel
        </Mantine.Button>
      </div>
    </form>
  )
}
