import * as FontAwesomeSolid from '@fortawesome/free-solid-svg-icons'
import * as FontAwesome from '@fortawesome/react-fontawesome'
import * as Mantine from '@mantine/core'
import * as API from './API'
import { Tags } from './Tags'

export const Entry = ({ hit, onEditClick }: {
    hit: API.Hit
    onEditClick(): void
  }) => (

  <div className="flex flex-col gap-2 items-start">
    <a className="text-sm dark:text-slate-400 dark:hover:text-slate-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 w-full truncate"
      href={hit.url} rel="noreferrer noopener" dangerouslySetInnerHTML={{__html: hit.urlHTML}}/>

    <div className="flex flex-col gap-1">
      <h3 className="text-lg font-semibold flex flex-row gap-3 items-center">
        <a className="dark:hover:text-slate-50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          href={hit.url} rel="noreferrer noopener" dangerouslySetInnerHTML={{__html: hit.titleHTML}}/>

        <Mantine.ActionIcon className="active:!translate-y-0 !font-inherit !text-lg dark:hover:bg-slate-600 dark:text-slate-500 dark:hover:text-slate-50 dark:focus:!outline-indigo-300"
          title="Edit" onClick={onEditClick}>

          <FontAwesome.FontAwesomeIcon icon={FontAwesomeSolid.faEdit}/>
        </Mantine.ActionIcon>
      </h3>

      { hit.descriptionHTML !== '' && <p dangerouslySetInnerHTML={{__html: hit.descriptionHTML}}/> }
    </div>

    {
      (hit.tags && hit.tags.length > 0) &&
      <Tags tags={hit.tags}/>
    }
  </div>
)
