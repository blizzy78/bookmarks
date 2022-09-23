import * as FontAwesomeSolid from '@fortawesome/free-solid-svg-icons'
import * as FontAwesome from '@fortawesome/react-fontawesome'
import * as Mantine from '@mantine/core'
import * as API from './API'
import { Tags } from './Tags'

export const Entry = ({ hit, onEditClick }: {
    hit: API.Hit
    onEditClick(): void
  }): JSX.Element => (

  <div className="flex flex-col gap-1">
    <a className="text-sm dark:text-green-400" href={hit.url} rel="noreferrer noopener" dangerouslySetInnerHTML={{__html: hit.urlHTML}}/>

    <h3 className="flex flex-row gap-3 items-center">
      <a className="dark:text-blue-400 font-semibold" href={hit.url} rel="noreferrer noopener" dangerouslySetInnerHTML={{__html: hit.titleHTML}}/>

      <Mantine.ActionIcon title="Edit" variant="subtle" onClick={onEditClick} className="dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-700">
        <FontAwesome.FontAwesomeIcon icon={FontAwesomeSolid.faEdit}/>
      </Mantine.ActionIcon>
    </h3>

    {
      hit.descriptionHTML !== '' &&
      <p dangerouslySetInnerHTML={{__html: hit.descriptionHTML}}/>
    }

    {
      (hit.tags && hit.tags.length > 0) &&
      <Tags tags={hit.tags}/>
    }
  </div>
)
