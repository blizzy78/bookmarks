/* eslint-disable react/prop-types */
import React, { useEffect } from 'react'
import './Modal.css'

const Modal = ({title, children, buttons, onCancel}) => {
  useEffect(() => {
    const handleKey = e => {
      if (e.keyCode === 27) {
        onCancel()
      }
    }

    document.body.classList.add('modal-open')
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.classList.remove('modal-open')
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  return <>
    <div className="fixed top-0 left-0 z-30 w-screen h-screen bg-black opacity-50"/>
    <div className="fixed top-0 left-0 z-40 w-full h-full overflow-x-hidden overflow-y-auto bg-red" onClick={onCancel}>
      <div className="relative w-auto max-w-full md:max-w-screen-sm xl:max-w-screen-lg mx-5 md:mx-auto my-8 pointer-events-none">
        <div className="relative flex flex-col w-full rounded border border-gray-500 bg-white dark:bg-gray-900 pointer-events-auto" onClick={e => e.stopPropagation()}>
          <div className="flex flex-shrink-0 items-center justify-between p-4 border-b">
            <h2 className="my-0">{title}</h2>
            <button type="button" className="btn-modal-close dark:btn-modal-close-light" onClick={onCancel} aria-label="Close"></button>
          </div>

          <div className="relative flex-auto p-4">
            {children}
          </div>

          <div className="flex flex-wrap flex-shrink-0 items-center justify-end p-3 border-t">
            {buttons}
          </div>
        </div>
      </div>
    </div>
  </>
}

export default Modal
