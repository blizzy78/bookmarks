import 'server-only'

import { parse as parseJson } from '@hapi/bourne'
import { revalidatePath } from 'next/cache'
import * as APISchema from './APISchema'

const backendBaseURI = process.env.BACKEND_BASE_URI

export async function fetchBookmark(objectID: string) {
  const res = await fetch(`${backendBaseURI}/rest/bookmark/${encodeURIComponent(objectID)}`, {
    method: 'GET',
  })

  const json = await res.text()

  return APISchema.BookmarkSchema.parse(parseJson(json))
}

export async function fetchUpdateBookmark(bookmark: APISchema.Bookmark) {
  const objectID = bookmark.objectID as string

  await fetch(`${backendBaseURI}/rest/bookmark/${encodeURIComponent(objectID)}`, {
    method: 'PUT',
    body: JSON.stringify(bookmark),
  })

  revalidatePath(`/edit/${encodeURIComponent(objectID)}`)
  revalidatePath('/search/[query]', 'layout')

  return null as unknown
}

export async function fetchCreateBookmark(bookmark: APISchema.Bookmark) {
  await fetch(`${backendBaseURI}/rest/bookmark`, {
    method: 'POST',
    body: JSON.stringify(bookmark),
  })

  revalidatePath('/search/[query]', 'layout')

  return null as unknown
}

export async function fetchDeleteBookmark(objectID: string) {
  await fetch(`${backendBaseURI}/rest/bookmark/${encodeURIComponent(objectID)}`, {
    method: 'DELETE',
  })

  revalidatePath('/search/[query]', 'layout')

  return null as unknown
}

export async function fetchSearch(query: string) {
  const res = await fetch(`${backendBaseURI}/rest/bookmarks?q=${encodeURIComponent(query)}`, {
    method: 'GET',
  })

  const json = await res.text()

  return APISchema.SearchResultSchema.parse(parseJson(json))
}

export async function fetchAllTags() {
  const res = await fetch(`${backendBaseURI}/rest/bookmarks/tags`, {
    method: 'GET',
  })

  const json = await res.text()

  return APISchema.TagsListSchema.parse(parseJson(json))
}

export async function fetchTagCounts() {
  const res = await fetch(`${backendBaseURI}/rest/bookmarks/tagCounts`, {
    method: 'GET',
  })

  const json = await res.text()

  return APISchema.TagCountsSchema.parse(parseJson(json))
}
