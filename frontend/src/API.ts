import { parse as parseJson } from '@hapi/bourne'
import * as ReactQuery from '@tanstack/react-query'
import ky from 'ky'
import { useCallback } from 'react'
import { z } from 'zod'

const hitSchema = z.object({
  id: z.string().min(1),
  url: z.string().min(1),
  urlHTML: z.string().min(1),
  titleHTML: z.string().min(1),
  descriptionHTML: z.string(),
  tags: z.array(z.string().min(1)).min(1).optional(),
})

export type Hit = z.infer<typeof hitSchema>

const resultSchema = z.object({
  error: z.boolean(),
  hits: z.array(hitSchema),
})

export type Result = z.infer<typeof resultSchema>

const bookmarkSchema = z.object({
  objectID: z.string().min(1).optional(),
  url: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  tags: z.array(z.string().min(1)).min(1).optional(),
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

const tagCountsSchema = z.record(z.string().min(1), z.number().min(1))

export type TagCounts = z.infer<typeof tagCountsSchema>

const tagsListSchema = z.array(z.string().min(1))

export type TagsList = z.infer<typeof tagsListSchema>

export const createQueryClient = () =>
  new ReactQuery.QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: Infinity,
        gcTime: Infinity,
        retry: false,
      },
    },
  })

export const useSearch = (query: string) =>
  ReactQuery.useQuery({
    queryKey: ['search', query],

    async queryFn() {
      return resultSchema.parse(await ky.get(`/rest/bookmarks?q=${encodeURIComponent(query)}`, { parseJson }).json())
    },

    enabled: query.trim() !== '',
    staleTime: 15 * 60 * 1000,
  })

const useInvalidateSearch = () => {
  const queryClient = ReactQuery.useQueryClient()

  return useCallback(() => {
    queryClient.cancelQueries({ queryKey: ['search'] })
    queryClient.invalidateQueries({ queryKey: ['search'] })
  }, [queryClient])
}

export const useBookmark = (objectID?: string) =>
  ReactQuery.useQuery({
    queryKey: !!objectID ? ['bookmark', objectID] : ['bookmark.new'],

    async queryFn() {
      return !!objectID
        ? bookmarkSchema.parse(await ky.get(`/rest/bookmark/${encodeURIComponent(objectID)}`, { parseJson }).json())
        : emptyBookmark
    },

    staleTime: 15 * 60 * 1000,
  })

const useInvalidateBookmark = () => {
  const queryClient = ReactQuery.useQueryClient()

  return useCallback(
    (objectID: string) => {
      queryClient.cancelQueries({ queryKey: ['bookmark', objectID] })
      queryClient.invalidateQueries({ queryKey: ['bookmark', objectID] })
    },
    [queryClient],
  )
}

export const useCreateBookmark = () => {
  const invalidateSearch = useInvalidateSearch()
  const invalidateAllTags = useInvalidateAllTags()
  const invalidateAllTagCounts = useInvalidateAllTagCounts()

  const mutation = ReactQuery.useMutation({
    mutationFn(data: SaveBookmarkData) {
      return ky.post('/rest/bookmark', { json: data.bookmark, timeout: 30000 })
    },

    onMutate(variables: SaveBookmarkData) {
      variables.onCreating()
    },

    onSuccess(_, variables: SaveBookmarkData) {
      variables.onCreated()
      invalidateSearch()
      invalidateAllTags()
      invalidateAllTagCounts()
    },
  })

  return mutation.mutateAsync
}

export const useUpdateBookmark = () => {
  const invalidateBookmark = useInvalidateBookmark()
  const invalidateSearch = useInvalidateSearch()
  const invalidateAllTags = useInvalidateAllTags()
  const invalidateAllTagCounts = useInvalidateAllTagCounts()

  const mutation = ReactQuery.useMutation({
    mutationFn(data: SaveBookmarkData) {
      return ky.put(`/rest/bookmark/${encodeURIComponent(data.bookmark.objectID as string)}`, {
        json: data.bookmark,
        timeout: 30000,
      })
    },

    onMutate(variables: SaveBookmarkData) {
      variables.onCreating()
    },

    onSuccess(_, variables: SaveBookmarkData) {
      variables.onCreated()
      invalidateBookmark(variables.bookmark.objectID as string)
      invalidateSearch()
      invalidateAllTags()
      invalidateAllTagCounts()
    },
  })

  return mutation.mutateAsync
}

export const useDeleteBookmark = () => {
  const invalidateBookmark = useInvalidateBookmark()
  const invalidateSearch = useInvalidateSearch()
  const invalidateAllTags = useInvalidateAllTags()
  const invalidateAllTagCounts = useInvalidateAllTagCounts()

  const mutation = ReactQuery.useMutation({
    mutationFn(data: DeleteBookmarkData) {
      return ky.delete(`/rest/bookmark/${encodeURIComponent(data.objectID)}`, { timeout: 30000 })
    },

    onMutate(variables: DeleteBookmarkData) {
      variables.onDeleting()
    },

    onSuccess(_, variables: DeleteBookmarkData) {
      variables.onDeleted()
      invalidateBookmark(variables.objectID)
      invalidateSearch()
      invalidateAllTags()
      invalidateAllTagCounts()
    },
  })

  return mutation.mutateAsync
}

export const useAllTags = () =>
  ReactQuery.useQuery({
    queryKey: ['bookmarks.tags'],

    async queryFn() {
      return tagsListSchema.parse(await ky.get('/rest/bookmarks/tags', { parseJson }).json())
    },

    staleTime: 15 * 60 * 1000,
  })

const useInvalidateAllTags = () => {
  const queryClient = ReactQuery.useQueryClient()

  return useCallback(() => {
    queryClient.cancelQueries({ queryKey: ['bookmarks.tags'] })
    queryClient.invalidateQueries({ queryKey: ['bookmarks.tags'] })
  }, [queryClient])
}

export const useAllTagCounts = () =>
  ReactQuery.useQuery({
    queryKey: ['bookmarks.tagCounts'],

    async queryFn() {
      return tagCountsSchema.parse(await ky.get('/rest/bookmarks/tagCounts', { parseJson }).json())
    },

    staleTime: 15 * 60 * 1000,
  })

const useInvalidateAllTagCounts = () => {
  const queryClient = ReactQuery.useQueryClient()

  return useCallback(() => {
    queryClient.cancelQueries({ queryKey: ['bookmarks.tagCounts'] })
    queryClient.invalidateQueries({ queryKey: ['bookmarks.tagCounts'] })
  }, [queryClient])
}
