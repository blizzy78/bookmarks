export const Tags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row flex-wrap gap-2">
    {tags.map((t) => (
      <div
        key={t}
        className="rounded-full border px-3 py-0.5 text-sm dark:border-slate-500 dark:bg-slate-700 dark:text-slate-300"
      >
        {t}
      </div>
    ))}
  </div>
)
