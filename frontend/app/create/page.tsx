import * as API from '@/components/API'
import BookmarkEditor from '@/components/BookmarkEditor'
import { BookmarkFormData } from '@/components/BookmarkForm'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const allTags = await API.fetchAllTags()

  const onSave = async (values: BookmarkFormData) => {
    'use server'

    await API.fetchCreateBookmark(values)
  }

  return <BookmarkEditor allTags={allTags} onSave={onSave} keepOpenAndClearAfterSave />
}
