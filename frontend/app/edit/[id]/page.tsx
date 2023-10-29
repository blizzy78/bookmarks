import * as API from '@/components/API'
import * as APISchema from '@/components/APISchema'
import BookmarkEditor from '@/components/BookmarkEditor'
import { BookmarkFormData } from '@/components/BookmarkForm'

export default async function Page({ params }: { params: { id: string } }) {
  const bookmark = await API.fetchBookmark(params.id)
  const allTags = await API.fetchAllTags()

  const onDelete = async () => {
    'use server'

    await API.fetchDeleteBookmark(bookmark.objectID as string)
  }

  const onSave = async (values: BookmarkFormData) => {
    'use server'

    await API.fetchUpdateBookmark({
      ...values,
      objectID: bookmark.objectID,
    } satisfies APISchema.Bookmark)
  }

  return <BookmarkEditor bookmark={bookmark} allTags={allTags} onDelete={onDelete} onSave={onSave} />
}
