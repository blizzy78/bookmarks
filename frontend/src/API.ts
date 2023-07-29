import { parse as parseJson } from '@hapi/bourne'
import * as ReactQuery from '@tanstack/react-query'
import ky from 'ky'
import { useCallback } from 'react'
import { z } from 'zod'

const hitSchema = z.object({
  id: z.string().nonempty(),
  url: z.string().nonempty(),
  urlHTML: z.string().nonempty(),
  titleHTML: z.string().nonempty(),
  descriptionHTML: z.string(),
  tags: z.array(z.string().nonempty()).optional(),
})

export type Hit = z.infer<typeof hitSchema>

const resultSchema = z.object({
  error: z.boolean(),
  hits: z.array(hitSchema),
})

export type Result = z.infer<typeof resultSchema>

const bookmarkSchema = z.object({
  objectID: z.string().nonempty().optional(),
  url: z.string().nonempty(),
  title: z.string().nonempty(),
  description: z.string(),
  tags: z.array(z.string().nonempty()).optional(),
})

export type Bookmark = z.infer<typeof bookmarkSchema>

const emptyBookmark: Bookmark = {
  url: '',
  title: '',
  description: '',
}

export type SaveBookmarkData = {
  bookmark: Bookmark
  onCreating(): void
  onCreated(): void
}

export type DeleteBookmarkData = {
  objectID: string
  onDeleting(): void
  onDeleted(): void
}

const tagCountsSchema = z.record(z.string().nonempty(), z.number().min(1))

export type TagCounts = z.infer<typeof tagCountsSchema>

const tagsListSchema = z.array(z.string().nonempty())

export type TagsList = z.infer<typeof tagsListSchema>

export const createQueryClient = () =>
  new ReactQuery.QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: Infinity,
        cacheTime: Infinity,
        retry: false,
      },
    },
  })

export const useSearch = (query: string) =>
  ReactQuery.useQuery(
    ['search', query],
    async () =>
      resultSchema.parse(await ky.get(`/rest/bookmarks?q=${encodeURIComponent(query)}`, { parseJson }).json()),
    {
      enabled: query.trim() !== '',
      staleTime: 15 * 60 * 1000,
    }
  )

const useInvalidateSearch = () => {
  const queryClient = ReactQuery.useQueryClient()

  return useCallback(() => {
    queryClient.cancelQueries(['search'])
    queryClient.invalidateQueries(['search'])
  }, [queryClient])
}

export const useBookmark = (objectID?: string) =>
  ReactQuery.useQuery(
    !!objectID ? ['bookmark', objectID] : ['bookmark.new'],
    async () =>
      !!objectID
        ? bookmarkSchema.parse(await ky.get(`/rest/bookmark/${encodeURIComponent(objectID)}`, { parseJson }).json())
        : emptyBookmark,
    {
      staleTime: 15 * 60 * 1000,
    }
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

  const mutation = ReactQuery.useMutation<unknown, Error, SaveBookmarkData>(
    (data) => ky.post('/rest/bookmark', { json: data.bookmark, timeout: 30000 }),
    {
      onMutate: (variables) => variables.onCreating(),

      onSuccess: (_, variables) => {
        variables.onCreated()
        invalidateSearch()
        invalidateAllTags()
        invalidateAllTagCounts()
      },
    }
  )

  return mutation.mutateAsync
}

export const useUpdateBookmark = () => {
  const invalidateBookmark = useInvalidateBookmark()
  const invalidateSearch = useInvalidateSearch()
  const invalidateAllTags = useInvalidateAllTags()
  const invalidateAllTagCounts = useInvalidateAllTagCounts()

  const mutation = ReactQuery.useMutation<unknown, Error, SaveBookmarkData>(
    (data) =>
      ky.put(`/rest/bookmark/${encodeURIComponent(data.bookmark.objectID as string)}`, {
        json: data.bookmark,
        timeout: 30000,
      }),
    {
      onMutate: (variables) => variables.onCreating(),

      onSuccess: (_, variables) => {
        variables.onCreated()
        invalidateBookmark(variables.bookmark.objectID as string)
        invalidateSearch()
        invalidateAllTags()
        invalidateAllTagCounts()
      },
    }
  )

  return mutation.mutateAsync
}

export const useDeleteBookmark = () => {
  const invalidateBookmark = useInvalidateBookmark()
  const invalidateSearch = useInvalidateSearch()
  const invalidateAllTags = useInvalidateAllTags()
  const invalidateAllTagCounts = useInvalidateAllTagCounts()

  const mutation = ReactQuery.useMutation<unknown, Error, DeleteBookmarkData>(
    (data) => ky.delete(`/rest/bookmark/${encodeURIComponent(data.objectID)}`, { timeout: 30000 }),
    {
      onMutate: (variables) => variables.onDeleting(),

      onSuccess: (_, variables) => {
        variables.onDeleted()
        invalidateBookmark(variables.objectID)
        invalidateSearch()
        invalidateAllTags()
        invalidateAllTagCounts()
      },
    }
  )

  return mutation.mutateAsync
}

export const useAllTags = () =>
  ReactQuery.useQuery(
    ['bookmarks.tags'],
    async () => tagsListSchema.parse(await ky.get('/rest/bookmarks/tags', { parseJson }).json()),
    {
      staleTime: 15 * 60 * 1000,
    }
  )

const useInvalidateAllTags = () => {
  const queryClient = ReactQuery.useQueryClient()

  return useCallback(() => {
    queryClient.cancelQueries(['bookmarks.tags'])
    queryClient.invalidateQueries(['bookmarks.tags'])
  }, [queryClient])
}

export const useAllTagCounts = () =>
  ReactQuery.useQuery(
    ['bookmarks.tagCounts'],
    async () => tagCountsSchema.parse(await ky.get('/rest/bookmarks/tagCounts', { parseJson }).json()),
    {
      staleTime: 15 * 60 * 1000,
    }
  )

const useInvalidateAllTagCounts = () => {
  const queryClient = ReactQuery.useQueryClient()

  return useCallback(() => {
    queryClient.cancelQueries(['bookmarks.tagCounts'])
    queryClient.invalidateQueries(['bookmarks.tagCounts'])
  }, [queryClient])
}
