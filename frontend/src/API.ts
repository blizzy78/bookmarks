import * as ReactQuery from '@tanstack/react-query'
import { useCallback } from 'react'
import * as FetchUtil from './FetchUtil'

export interface Result {
  error: boolean
  hits: Hit[]
}

export interface Hit {
  id: string
  url: string
  urlHTML: string
  titleHTML: string
  descriptionHTML: string
  tags?: string[]
}

export interface Bookmark {
  objectID?: string
  url: string
  title: string
  description: string
  tags?: string[]
}

const emptyBookmark: Bookmark = {
  url: '',
  title: '',
  description: '',
}

export interface SaveBookmarkData {
  bookmark: Bookmark
  onCreating(): void
  onCreated(): void
}

export interface DeleteBookmarkData {
  objectID: string
  onDeleting(): void
  onDeleted(): void
}

export type TagCountMap = {
  readonly [tag: string]: number
}

export const createQueryClient = () => new ReactQuery.QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      cacheTime: Infinity,
      // cannot pass retry here
    }
  }
})

const retry = (_: number, error: FetchUtil.HTTPError) => error.status != 404 && error.status < 500

export const useSearch = (query: string) => (
  ReactQuery.useQuery(
    ['search', query],
    () => FetchUtil.getJSON<Result>(`/rest/bookmarks?q=${encodeURIComponent(query)}`),
    {
      enabled: query.trim() !== '',
      staleTime: 15 * 60 * 1000,
      retry: retry
    }
  )
)

const useInvalidateSearch = () => {
  const queryClient = ReactQuery.useQueryClient()

  return useCallback(
    () => {
      queryClient.cancelQueries(['search'])
      queryClient.invalidateQueries(['search'])
    },
    [queryClient]
  )
}

export const useBookmark = (objectID?: string) => (
  ReactQuery.useQuery(
    objectID ? ['bookmark', objectID] : ['bookmark.new'],
    () => objectID ? FetchUtil.getJSON<Bookmark>(`/rest/bookmark/${encodeURIComponent(objectID)}`) : emptyBookmark,
    {
      staleTime: 15 * 60 * 1000,
      retry: retry
    }
  )
)

const useInvalidateBookmark = () => {
  const queryClient = ReactQuery.useQueryClient()

  return useCallback(
    (objectID: string) => {
      queryClient.cancelQueries(['bookmark', objectID])
      queryClient.invalidateQueries(['bookmark', objectID])
    },
    [queryClient]
  )
}

export const useCreateBookmark = () => {
  const invalidateSearch = useInvalidateSearch()
  const invalidateAllTags = useInvalidateAllTags()
  const invalidateAllTagCounts = useInvalidateAllTagCounts()

  const mutation = ReactQuery.useMutation<undefined, FetchUtil.HTTPError, SaveBookmarkData>(
    data => FetchUtil.postJSON('/rest/bookmark', data.bookmark),
    {
      onMutate: variables => variables.onCreating(),

      onSuccess: (_, variables) => {
        variables.onCreated()
        invalidateSearch()
        invalidateAllTags()
        invalidateAllTagCounts()
      }
    }
  )

  return mutation.mutateAsync
}

export const useUpdateBookmark = () => {
  const invalidateBookmark = useInvalidateBookmark()
  const invalidateSearch = useInvalidateSearch()
  const invalidateAllTags = useInvalidateAllTags()
  const invalidateAllTagCounts = useInvalidateAllTagCounts()

  const mutation = ReactQuery.useMutation<undefined, FetchUtil.HTTPError, SaveBookmarkData>(
    data => FetchUtil.putJSON(`/rest/bookmark/${encodeURIComponent(data.bookmark.objectID as string)}`, data.bookmark),
    {
      onMutate: variables => variables.onCreating(),

      onSuccess: (_, variables) => {
        variables.onCreated()
        invalidateBookmark(variables.bookmark.objectID as string)
        invalidateSearch()
        invalidateAllTags()
        invalidateAllTagCounts()
      }
    }
  )

  return mutation.mutateAsync
}

export const useDeleteBookmark = () => {
  const invalidateBookmark = useInvalidateBookmark()
  const invalidateSearch = useInvalidateSearch()
  const invalidateAllTags = useInvalidateAllTags()
  const invalidateAllTagCounts = useInvalidateAllTagCounts()

  const mutation = ReactQuery.useMutation<undefined, FetchUtil.HTTPError, DeleteBookmarkData>(
    data => FetchUtil.deleteJSON(`/rest/bookmark/${encodeURIComponent(data.objectID)}`),
    {
      onMutate: variables => variables.onDeleting(),

      onSuccess: (_, variables) => {
        variables.onDeleted()
        invalidateBookmark(variables.objectID as string)
        invalidateSearch()
        invalidateAllTags()
        invalidateAllTagCounts()
      }
    }
  )

  return mutation.mutateAsync
}

export const useAllTags = () => (
  ReactQuery.useQuery(
    ['bookmarks.tags'],
    () => FetchUtil.getJSON<string[]>('/rest/bookmarks/tags'),
    {
      staleTime: 15 * 60 * 1000,
      retry: retry
    }
  )
)

const useInvalidateAllTags = () => {
  const queryClient = ReactQuery.useQueryClient()

  return useCallback(
    () => {
      queryClient.cancelQueries(['bookmarks.tags'])
      queryClient.invalidateQueries(['bookmarks.tags'])
    },
    [queryClient]
  )
}

export const useAllTagCounts = () => (
  ReactQuery.useQuery(
    ['bookmarks.tagCounts'],
    () => FetchUtil.getJSON<TagCountMap>('/rest/bookmarks/tagCounts'),
    {
      staleTime: 15 * 60 * 1000,
      retry: retry
    }
  )
)

const useInvalidateAllTagCounts = () => {
  const queryClient = ReactQuery.useQueryClient()

  return useCallback(
    () => {
      queryClient.cancelQueries(['bookmarks.tagCounts'])
      queryClient.invalidateQueries(['bookmarks.tagCounts'])
    },
    [queryClient]
  )
}
