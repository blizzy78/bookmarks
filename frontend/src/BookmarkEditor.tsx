import * as Mantine from '@mantine/core'
import { BookmarkForm, BookmarkFormData } from './EditBookmark'

export default function BookmarkEditor({
  bookmarkID,
  onSave,
  onClose,
  onDelete,
}: {
  bookmarkID?: { id?: string }
  onSave(values: BookmarkFormData): void
  onClose(): void
  onDelete(): void
}) {
  return (
    <Mantine.Drawer
      size="xl"
      padding="lg"
      title={bookmarkID?.id ? 'Edit Bookmark' : 'Add Bookmark'}
      opened={!!bookmarkID}
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
      {!!bookmarkID && <BookmarkForm objectID={bookmarkID.id} onSave={onSave} onClose={onClose} onDelete={onDelete} />}
    </Mantine.Drawer>
  )
}
