import React from 'react'
import Icon from './Icon'
import Tags from './Tags'
import PropTypes from 'prop-types'
import './Entry.css'

const Entry = ({result, onEditClick, onEditMouseOver}) => (
  <div className="entry flex flex-col gap-1">
    <h3 className="my-0 flex flex-row gap-3">
      <a className="text-blue-600 dark:text-blue-400" href={result.url} dangerouslySetInnerHTML={{__html: result.titleHTML}}/>

      <button className="edit-button outline-none focus:outline-none" type="button" title="Edit"
        onClick={onEditClick} onMouseOver={onEditMouseOver}>

        <Icon name="fa-edit"/>
      </button>
    </h3>

    <a className="text-sm font-normal text-green-600 dark:text-green-400" href={result.url} dangerouslySetInnerHTML={{__html: result.urlHTML}}/>

    {
      result.descriptionHTML.length > 0 &&
      <p className="my-0" dangerouslySetInnerHTML={{__html: result.descriptionHTML}}/>
    }

    {
      (result.tags && result.tags.length > 0) &&
      <Tags tags={result.tags}/>
    }
  </div>
)

Entry.propTypes = {
  result: PropTypes.object.isRequired,
  onEditClick: PropTypes.func,
  onEditMouseOver: PropTypes.func
}

export default Entry
