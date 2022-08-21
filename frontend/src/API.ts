import { MutableRefObject, useCallback } from 'react'
import * as ReactQuery from 'react-query'
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
  objectID: string | undefined
  url: string
  title: string
  description: string
  tags?: string[]
}

const retry = (failureCount: number, error: FetchUtil.HTTPError) => error.status != 404 && error.status < 500

export const useSearch = (query: MutableRefObject<string>): ReactQuery.UseQueryResult<Result, FetchUtil.HTTPError> => (
  ReactQuery.useQuery(
    ['search'],
    () => {
      if (query.current === '') {
        return {
          error: false,
          hits: []
        }
      }

      return FetchUtil.getJSON(`/rest/bookmarks?q=${encodeURIComponent(query.current)}`)
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      retry: retry
    }
  )
)

export const useInvalidateSearch = (): () => void => {
  const queryClient = ReactQuery.useQueryClient()

  return useCallback(
    () => {
      queryClient.cancelQueries(['search'])
      queryClient.invalidateQueries(['search'])
    },
    [queryClient]
  )
}

export const useBookmark = (objectID: string | undefined): ReactQuery.UseQueryResult<Bookmark, FetchUtil.HTTPError> => (
  ReactQuery.useQuery(
    objectID ? ['bookmark', objectID] : ['bookmark.new'],
    () => objectID ? FetchUtil.getJSON(`/rest/bookmark/${encodeURIComponent(objectID)}`) : {},
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      retry: retry
    }
  )
)

const useInvalidateBookmark = (): (objectID: string) => void => {
  const queryClient = ReactQuery.useQueryClient()

  return useCallback(
    objectID => {
      queryClient.cancelQueries(['bookmark', objectID])
      queryClient.invalidateQueries(['bookmark', objectID])
    },
    [queryClient]
  )
}

export interface SaveBookmarkData {
  bookmark: Bookmark
  onCreating(): void
  onCreated(): void
}

export const useCreateBookmark = (): ((data: SaveBookmarkData) => Promise<undefined>) => {
  const invalidateAllTags = useInvalidateAllTags()

  const mutation = ReactQuery.useMutation<undefined, FetchUtil.HTTPError, SaveBookmarkData>(
    (data: SaveBookmarkData) => FetchUtil.postJSON('/rest/bookmark', data.bookmark),
    {
      onMutate: variables => variables.onCreating(),

      onSuccess: (data, variables) => {
        variables.onCreated()
        invalidateAllTags()
      }
    }
  )

  return mutation.mutateAsync
}

export const useUpdateBookmark = (): ((data: SaveBookmarkData) => Promise<undefined>) => {
  const invalidateBookmark = useInvalidateBookmark()
  const invalidateSearch = useInvalidateSearch()
  const invalidateAllTags = useInvalidateAllTags()

  const mutation = ReactQuery.useMutation<undefined, FetchUtil.HTTPError, SaveBookmarkData>(
    (data: SaveBookmarkData) => FetchUtil.putJSON(`/rest/bookmark/${encodeURIComponent(data.bookmark.objectID as string)}`, data.bookmark),
    {
      onMutate: variables => variables.onCreating(),

      onSuccess: (data, variables) => {
        variables.onCreated()
        invalidateBookmark(variables.bookmark.objectID as string)
        invalidateSearch()
        invalidateAllTags()
      }
    }
  )

  return mutation.mutateAsync
}

export interface DeleteBookmarkData {
  objectID: string
  onDeleting(): void
  onDeleted(): void
}

export const useDeleteBookmark = (): ((data: DeleteBookmarkData) => Promise<undefined>) => {
  const invalidateBookmark = useInvalidateBookmark()
  const invalidateSearch = useInvalidateSearch()
  const invalidateAllTags = useInvalidateAllTags()

  const mutation = ReactQuery.useMutation<undefined, FetchUtil.HTTPError, DeleteBookmarkData>(
    (data: DeleteBookmarkData) => FetchUtil.deleteJSON(`/rest/bookmark/${encodeURIComponent(data.objectID)}`),
    {
      onMutate: variables => variables.onDeleting(),

      onSuccess: (data, variables) => {
        variables.onDeleted()
        invalidateBookmark(variables.objectID as string)
        invalidateSearch()
        invalidateAllTags()
      }
    }
  )

  return mutation.mutateAsync
}

export const useAllTags = (): ReactQuery.UseQueryResult<string[], FetchUtil.HTTPError> => (
  ReactQuery.useQuery(
    ['bookmarks.tags'],
    () => FetchUtil.getJSON('/rest/bookmarks/tags'),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      retry: retry
    }
  )
)

const useInvalidateAllTags = (): () => void => {
  const queryClient = ReactQuery.useQueryClient()

  return useCallback(
    () => {
      queryClient.cancelQueries(['bookmarks.tags'])
      queryClient.invalidateQueries(['bookmarks.tags'])
    },
    [queryClient]
  )
}
