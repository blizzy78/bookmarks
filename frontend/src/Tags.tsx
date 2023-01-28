
export const Tags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-2">
    {
      tags.map(t => (
        <div key={t} className="rounded-full dark:bg-slate-600 border dark:border-slate-500 dark:text-slate-300 px-3 py-0.5 text-sm">
          {t}
        </div>
      ))
    }
  </div>
)
