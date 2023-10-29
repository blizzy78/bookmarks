import { z } from 'zod'

export const HitSchema = z.object({
  id: z.string().min(1),
  url: z.string().min(1),
  urlHTML: z.string().min(1),
  titleHTML: z.string().min(1),
  descriptionHTML: z.string(),
  tags: z.array(z.string().min(1)).min(1).optional(),
})

export type Hit = z.infer<typeof HitSchema>

export const SearchResultSchema = z.object({
  error: z.boolean(),
  hits: z.array(HitSchema),
})

export type SearchResult = z.infer<typeof SearchResultSchema>

export const BookmarkSchema = z.object({
  objectID: z.string().min(1).optional(),
  url: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  tags: z.array(z.string().min(1)).min(1).optional(),
})

export type Bookmark = z.infer<typeof BookmarkSchema>

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

export const TagCountsSchema = z.record(z.string().min(1), z.number().min(1))

export type TagCounts = z.infer<typeof TagCountsSchema>

export const TagsListSchema = z.array(z.string().min(1))

export type TagsList = z.infer<typeof TagsListSchema>
