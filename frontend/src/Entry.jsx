import React from 'react'
import Icon from './Icon'
import Tags from './Tags'
import PropTypes from 'prop-types'
import './Entry.css'

const Entry = ({result, onTagClick, onEditClick, onEditMouseOver}) => (
  <div className="entry mb-4">
    <h3 className="my-0">
      <a className="text-blue-600 dark:text-blue-400" href={result.url} dangerouslySetInnerHTML={{__html: result.titleHTML}}/>

      <button className="edit-button outline-none focus:outline-none ml-2" type="button" title="Edit"
        onClick={onEditClick} onMouseOver={onEditMouseOver}>

        <Icon name="fa-edit"/>
      </button>
    </h3>

    <a className="block text-sm text-green-600 dark:text-green-400 font-normal" href={result.url} dangerouslySetInnerHTML={{__html: result.urlHTML}}/>

    {
      result.descriptionHTML.length > 0 &&
      <p className="my-0" dangerouslySetInnerHTML={{__html: result.descriptionHTML}}/>
    }

    {
      result.tags.length > 0 &&
      <div className="text-xs mt-1">
        <Tags tags={result.tags} onTagClick={onTagClick}/>
      </div>
    }
  </div>
)

Entry.propTypes = {
  result: PropTypes.object.isRequired,
  onTagClick: PropTypes.func,
  onEditClick: PropTypes.func,
  onEditMouseOver: PropTypes.func
}

export default Entry
