'use client'

import * as FontAwesomeSolid from '@fortawesome/free-solid-svg-icons'
import * as FontAwesome from '@fortawesome/react-fontawesome'
import * as Mantine from '@mantine/core'
import { useRouter } from 'next/navigation'

export default function EntryEditButton({ objectID }: { objectID: string }) {
  const router = useRouter()

  const route = `/edit/${encodeURIComponent(objectID)}`
  const onEditClick = () => router.push(route)
  const onEditMouseEnter = () => router.prefetch(route)

  return (
    <Mantine.ActionIcon
      className="!font-inherit !text-lg active:!translate-y-0 dark:text-slate-500 dark:hover:bg-slate-600 dark:hover:text-slate-50 dark:focus:!outline-indigo-300"
      title="Edit"
      onClick={onEditClick}
      onMouseEnter={onEditMouseEnter}
    >
      <FontAwesome.FontAwesomeIcon icon={FontAwesomeSolid.faEdit} />
    </Mantine.ActionIcon>
  )
}
