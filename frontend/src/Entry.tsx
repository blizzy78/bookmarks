import * as FontAwesomeSolid from '@fortawesome/free-solid-svg-icons'
import * as FontAwesome from '@fortawesome/react-fontawesome'
import * as Mantine from '@mantine/core'
import * as API from './API'
import { Tags } from './Tags'

export const Entry = ({ hit, onEditClick }: {
    hit: API.Hit
    onEditClick(): void
  }) => (

  <div className="flex flex-col gap-2">
    <a className="text-sm dark:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300" href={hit.url} rel="noreferrer noopener" dangerouslySetInnerHTML={{__html: hit.urlHTML}}/>

    <div className="flex flex-col gap-1">
      <h3 className="text-lg flex flex-row gap-3 items-center">
        <a className="dark:text-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300" href={hit.url} rel="noreferrer noopener" dangerouslySetInnerHTML={{__html: hit.titleHTML}}/>

        <Mantine.ActionIcon title="Edit" variant="subtle" onClick={onEditClick} className="active:!translate-y-0 !font-inherit !text-lg dark:hover:bg-slate-600 dark:text-slate-400 dark:hover:text-slate-50 dark:focus:!outline-indigo-300">
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
