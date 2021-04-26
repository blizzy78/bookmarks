import React, {forwardRef} from 'react'

export default function withAutoID(WrappedComponent) {
  const wrapper = (props, ref) => {
    const id = 'c-' + new Date().getTime() + '-' + Math.floor(Math.random() * 999999)
    return (
      <WrappedComponent id={id} ref={ref} {...props}/>
    )
  }

  wrapper.displayName = 'WithAutoID(' + (WrappedComponent.displayName || WrappedComponent.name || 'Component') + ')'

  return forwardRef(wrapper)
}
