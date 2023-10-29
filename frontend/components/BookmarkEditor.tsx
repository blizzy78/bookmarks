'use client'

import * as Mantine from '@mantine/core'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import * as APISchema from './APISchema'
import BookmarkForm, { BookmarkFormData } from './BookmarkForm'

export default function BookmarkEditor({
  bookmark,
  allTags,
  onSave,
  onDelete,
  keepOpenAndClearAfterSave,
}: {
  bookmark?: APISchema.Bookmark
  allTags: APISchema.TagsList
  onSave(values: BookmarkFormData): Promise<void>
  onDelete?(): void
  keepOpenAndClearAfterSave?: boolean
}) {
  // // prefetch all tags so that the editor opens faster
  // API.usePrefetchAllTags()()

  const [formKey, setFormKey] = useState(0)
  const [formBookmark, setFormBookmark] = useState(bookmark)

  const router = useRouter()

  const onClose = () => router.back()

  const onDeleteInternal = !!onDelete
    ? async () => {
        if (!confirm('Delete bookmark?')) {
          return
        }

        await onDelete()
        onClose()
      }
    : undefined

  const onSaveInternal = async (values: BookmarkFormData) => {
    await onSave(values)

    if (keepOpenAndClearAfterSave) {
      setFormBookmark(undefined)
      setFormKey((k) => k + 1)
      return
    }

    onClose()
  }

  return (
    <Mantine.Drawer
      size="xl"
      padding="lg"
      title={!!formBookmark ? 'Edit Bookmark' : 'Add Bookmark'}
      opened
      onClose={onClose}
      classNames={{
        overlay: '!bg-slate-900 !opacity-60',
        content: 'flex flex-col gap-5 dark:!bg-slate-700 dark:!text-inherit',
        header: 'dark:!bg-slate-700',
        title: '!font-roboto-condensed text-xl font-semibold',
        close:
          'active:!translate-y-0 dark:hover:!bg-slate-600 dark:focus:!outline-indigo-300 dark:[&_*]:!fill-slate-300 dark:[&_*]:hover:!fill-slate-50',
      }}
      transitionProps={{
        duration: 0,
      }}
    >
      <BookmarkForm
        key={formKey}
        bookmark={formBookmark}
        allTags={allTags}
        onDelete={onDeleteInternal}
        onSave={onSaveInternal}
        onClose={onClose}
      />
    </Mantine.Drawer>
  )
}
