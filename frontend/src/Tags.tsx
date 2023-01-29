
export const Tags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row flex-wrap gap-2">
    {
      tags.map(t => (
        <div key={t} className="rounded-full dark:bg-slate-700 border dark:border-slate-600 dark:text-slate-300 px-3 py-0.5 text-sm">
          {t}
        </div>
      ))
    }
  </div>
)
