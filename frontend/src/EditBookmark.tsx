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

export const BookmarkForm = ({ objectID, onSave, onClose, onDelete }: {
    objectID?: string
    onSave(values: BookmarkFormData): boolean
    onClose(): void
    onDelete(): void
  }): JSX.Element => {

  const form = MantineForm.useForm<BookmarkFormData>({
    initialValues: {
      url: '',
      title: '',
      description: '',
      tags: []
    },

    validate: {
      url: value => value.length === 0 ? 'URL is required' : null,
      title: value => value.length === 0 ? 'Title is required' : null
    }
  })

  const [tags, setTags] = useState<Mantine.SelectItem[]>([])

  const { data, isFetching } = API.useBookmark(objectID)

  useEffect(
    () => {
      const tags = data?.tags?.map(t => ({ value: t, label: t })) ?? []
      setTags(tags)

      form.setValues({
        url: data?.url ?? '',
        title: data?.title ?? '',
        description: data?.description ?? '',
        tags: data?.tags ?? []
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )

  const onCreateTag = (t: string) => {
    const tag = { value: t, label: t }
    setTags(tags => [...tags, tag])
    return tag
  }

  const onSaveInternal = (values: BookmarkFormData) => {
    if (onSave(values)) {
      form.reset()
    }
  }

  return (
    <form onSubmit={form.onSubmit(onSaveInternal)} className="relative flex flex-col gap-10">
      <Mantine.LoadingOverlay visible={!!objectID && isFetching}/>

      <div className="flex flex-col gap-3">
        <Mantine.TextInput label="URL" withAsterisk {...form.getInputProps('url')}/>
        <Mantine.TextInput label="Title" withAsterisk {...form.getInputProps('title')}/>
        <Mantine.Textarea label="Description" autosize minRows={2} {...form.getInputProps('description')}/>

        <Mantine.MultiSelect label="Tags" data={tags} searchable {...form.getInputProps('tags')}
          creatable getCreateLabel={q => `+ ${q}`} onCreate={onCreateTag}/>
      </div>

      <div className="flex flex-row gap-3 justify-end">
        <Mantine.Button type="submit" className="dark:text-slate-200" disabled={!form.isValid()}>
          Save
        </Mantine.Button>

        {
          objectID &&
          <Mantine.Button type="button" className="dark:text-slate-200" color="red" onClick={onDelete}>
            Delete
          </Mantine.Button>
        }

        <Mantine.Button type="button" className="dark:text-slate-200" variant="default" onClick={onClose}>
          Cancel
        </Mantine.Button>
      </div>
    </form>
  )
}
