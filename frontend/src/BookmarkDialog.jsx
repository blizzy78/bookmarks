/* eslint-disable react/prop-types */
import React, {forwardRef, useEffect, useImperativeHandle, useRef} from 'react'
import Modal from './Modal'
import FormInputGroup from './FormInputGroup'
import TextInput from './TextInput'
import TextArea from './TextArea'
import TagsInput from './TagsInput'
import Button from './Button'
import Form from './Form'

const BookmarkDialog = ({bookmark, onBookmarkChange, onCancel, onSave, onDelete}, ref) => {
  const urlRef = useRef(null)
  const titleRef = useRef(null)
  const descriptionRef = useRef(null)

  const handleChangeURL = url => {
    onBookmarkChange({
      id: bookmark.id,
      url: url,
      title: bookmark.title,
      description: bookmark.description,
      tags: bookmark.tags
    })
  }

  const handleChangeTitle = title => {
    onBookmarkChange({
      id: bookmark.id,
      url: bookmark.url,
      title: title,
      description: bookmark.description,
      tags: bookmark.tags
    })
  }

  const handleChangeDescription = description => {
    onBookmarkChange({
      id: bookmark.id,
      url: bookmark.url,
      title: bookmark.title,
      description: description,
      tags: bookmark.tags
    })
  }

  const handleChangeTags = tags => {
    onBookmarkChange({
      id: bookmark.id,
      url: bookmark.url,
      title: bookmark.title,
      description: bookmark.description,
      tags: tags
    })
  }

  const buttons = () => {
    return <>
      <Button className="flex-none m-1" onClick={onSave}>Save</Button>
      {
        bookmark.id !== null &&
        <Button buttonStyle="danger" outline={true} className="flex-none m-1" onClick={onDelete}>Delete</Button>
      }
      <Button buttonStyle="secondary" outline={true} className="flex-none m-1" onClick={onCancel}>Cancel</Button>
    </>
  }

  useImperativeHandle(ref, () => ({
    resetFocus: () => {
      urlRef.current.focus()
    }
  }))

  useEffect(() => {
    urlRef.current.focus()
  }, [])

  return (
    <Modal ref={ref} title={bookmark.id !== null ? 'Edit Bookmark' : 'Add Bookmark'} buttons={buttons()} onCancel={onCancel}>
      <Form>
        <FormInputGroup label="URL" labelForRef={urlRef} className="mb-3">
          <TextInput ref={urlRef} className="block w-full" value={bookmark.url} onChange={e => handleChangeURL(e.target.value)}/>
        </FormInputGroup>

        <FormInputGroup label="Title" labelForRef={titleRef} className="mb-3">
          <TextInput ref={titleRef} className="block w-full" value={bookmark.title} onChange={e => handleChangeTitle(e.target.value)}/>
        </FormInputGroup>

        <FormInputGroup label="Description" labelForRef={descriptionRef} className="mb-3">
          <TextArea ref={descriptionRef} className="block w-full" value={bookmark.description} onChange={e => handleChangeDescription(e.target.value)}/>
        </FormInputGroup>

        <FormInputGroup label="Tags">
          <TagsInput className="block w-full" tags={bookmark.tags} onChange={handleChangeTags}/>
        </FormInputGroup>
      </Form>
    </Modal>
  )
}

export default forwardRef(BookmarkDialog)
