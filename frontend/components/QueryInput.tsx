'use client'

import * as Mantine from '@mantine/core'
import * as MantineHooks from '@mantine/hooks'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function QueryInput({ value, error }: { value: string; error: boolean }) {
  const [query, setQuery] = useState(value)
  const [debouncedQuery] = MantineHooks.useDebouncedValue(query, 350)
  const debouncedQueryTrimmed = debouncedQuery.trim()

  const router = useRouter()

  const onCreateClick = () => router.push('/create')

  useEffect(() => {
    if (debouncedQueryTrimmed === '') {
      router.replace('/search/_')
      return
    }

    router.replace(`/search/${encodeURIComponent(debouncedQueryTrimmed)}`)
  }, [debouncedQueryTrimmed, router])

  return (
    <div className="grid grid-cols-[1fr_max-content] items-stretch">
      <Mantine.TextInput
        placeholder="Enter search query"
        radius="md"
        size="md"
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        error={error}
        classNames={{
          root: '!font-inherit',
          input:
            '!rounded-l-full !rounded-r-none !border !font-inherit !text-base !transition-none dark:!border-slate-400 dark:!bg-slate-700 dark:!text-inherit dark:focus:!border-indigo-300 md:!text-lg',
        }}
      />

      <Mantine.Button
        className="h-full !rounded-l-none !rounded-r-full !border-b !border-l-0 !border-r !border-t !pl-3 !pr-4 !font-inherit text-base !font-normal active:!translate-y-0 dark:border-slate-400 dark:!bg-slate-700 dark:text-inherit dark:hover:!bg-slate-600 dark:hover:text-slate-50 dark:focus:!outline-indigo-300 md:text-lg"
        onClick={onCreateClick}
      >
        Create
      </Mantine.Button>
    </div>
  )
}
