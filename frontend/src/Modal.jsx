/* eslint-disable react/prop-types */
import React, {forwardRef, useEffect, useLayoutEffect, useRef} from 'react'
import BModal from 'bootstrap/js/src/modal'
import './Modal.css'

const Modal = ({title, children, buttons, onCancel}, ref) => {
  const modalRef = useRef()

  useLayoutEffect(() => {
    modalRef.current = new BModal(ref.current, {backdrop: 'static', keyboard: false})
    ref.current.addEventListener('hidePrevented.bs.modal', onCancel)
  }, [])

  useEffect(() => {
    modalRef.current.show()

    return () => {
      modalRef.current.hide()
    }
  })

  return (
    <div ref={ref} className="modal hidden fixed top-0 left-0 z-40 w-full h-full overflow-hidden">
      <div className="modal-dialog relative w-auto max-w-full md:max-w-screen-sm xl:max-w-screen-lg mx-5 md:mx-auto my-8 pointer-events-none">
        <div className="relative flex flex-col w-full pointer-events-auto rounded border border-gray-500 bg-white dark:bg-gray-900">
          <div className="flex flex-shrink-0 items-center justify-between p-4 border-b">
            <h2 className="my-0">{title}</h2>
            <button type="button" className="btn-modal-close" onClick={onCancel} aria-label="Close"></button>
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
  )
}

export default forwardRef(Modal)
