import * as Mantine from '@mantine/core'
import * as MantineForm from '@mantine/form'
import { useEffect, useState } from 'react'
import * as API from './API'

export interface BookmarkFormData {
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
  onSave(values: BookmarkFormData): boolean
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

  const { data: allTagsData, isFetching: allTagsFetching } = API.useAllTags()

  useEffect(() => {
    if (!allTagsData) {
      setTags([])
      return
    }

    setTags(allTagsData.map((t) => ({ value: t, label: t })))
  }, [allTagsData])

  const { data, isFetching } = API.useBookmark(objectID)

  useEffect(
    () => {
      form.setValues({
        url: data?.url ?? '',
        title: data?.title ?? '',
        description: data?.description ?? '',
        tags: data?.tags ?? [],
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )

  const onCreateTag = (t: string) => {
    const tag = { value: t, label: t }
    setTags((tags) => [...tags, tag])
    return tag
  }

  const onSaveInternal = (values: BookmarkFormData) => {
    if (onSave(values)) {
      form.reset()
    }
  }

  return (
    <form onSubmit={form.onSubmit(onSaveInternal)} className="relative flex flex-col gap-10">
      <Mantine.LoadingOverlay visible={allTagsFetching || (!!objectID && isFetching)} overlayColor="#334155" />

      <div className="flex flex-col gap-5">
        <Mantine.TextInput
          label="URL"
          withAsterisk
          {...form.getInputProps('url')}
          classNames={{
            root: '!font-inherit !leading-none flex flex-col gap-1',
            label: '!text-base !font-normal dark:!text-inherit',
            required: '!text-inherit',
            input:
              '!rounded !font-inherit !text-base dark:!bg-slate-600 !border dark:!border-slate-400 dark:!text-inherit dark:focus:!border-indigo-300 !transition-none',
          }}
        />

        <Mantine.TextInput
          label="Title"
          withAsterisk
          {...form.getInputProps('title')}
          classNames={{
            root: '!font-inherit !leading-none flex flex-col gap-1',
            label: '!text-base !font-normal dark:!text-inherit',
            required: '!text-inherit',
            input:
              '!rounded !font-inherit !text-base dark:!bg-slate-600 !border dark:!border-slate-400 dark:!text-inherit dark:focus:!border-indigo-300 !transition-none',
          }}
        />

        <Mantine.Textarea
          label="Description"
          autosize
          minRows={3}
          {...form.getInputProps('description')}
          classNames={{
            root: '!font-inherit !leading-none flex flex-col gap-1',
            label: '!text-base !font-normal dark:!text-inherit',
            required: '!text-inherit',
            input:
              '!rounded !font-inherit !text-base dark:!bg-slate-600 !border dark:!border-slate-400 dark:!text-inherit dark:focus:!border-indigo-300 !transition-none',
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
            root: '!font-inherit !leading-none flex flex-col gap-1',
            label: '!text-base !font-normal dark:!text-inherit',
            input:
              '!rounded !font-inherit !text-base dark:!bg-slate-600 !border dark:!border-slate-400 dark:!text-inherit dark:focus-within:!border-indigo-300 !transition-none',
            defaultValue:
              '!rounded-full !border dark:!border-slate-400 dark:!bg-slate-500 dark:!text-inherit !font-normal',
            defaultValueLabel: '!font-inherit !text-sm dark:!text-slate-50',
            defaultValueRemove: 'dark:[&_*]:!fill-slate-50',
            searchInput: '!font-inherit !text-base !text-inherit focus:!outline-none',
            rightSection: 'dark:[&_*]:!fill-slate-300',
            dropdown:
              'dark:!bg-slate-600 dark:!rounded dark:!border dark:!border-slate-400 dark:hover:[&_.mantine-ScrollArea-scrollbar]:!bg-slate-500 dark:[&_.mantine-ScrollArea-thumb]:!bg-slate-300',
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
          className="!rounded !border !font-inherit !text-base !font-normal active:!translate-y-0 dark:!border-indigo-400 dark:!bg-indigo-700 dark:!text-indigo-100 dark:hover:!border-indigo-400 dark:hover:!bg-indigo-600 dark:hover:!text-indigo-50 dark:focus:!outline-indigo-300 dark:disabled:!border-indigo-500/60 dark:disabled:!bg-indigo-700/60 dark:disabled:!text-indigo-200/60"
        >
          Save
        </Mantine.Button>

        <Mantine.Button
          type="button"
          onClick={onClose}
          className="!rounded !border !font-inherit !text-base !font-normal active:!translate-y-0 dark:!border-slate-400 dark:!text-inherit dark:hover:!bg-slate-600 dark:hover:!text-slate-50 dark:focus:!outline-indigo-300"
        >
          Cancel
        </Mantine.Button>
      </div>
    </form>
  )
}
