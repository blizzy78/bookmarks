import React, {forwardRef} from 'react'

export default function withAutoID(WrappedComponent) {
  const wrapper = (props, ref) => {
    let {id, ...rest} = props
    if (!id) {
      id = 'c-' + new Date().getTime() + '-' + Math.floor(Math.random() * 999999)
    }

    return (
      <WrappedComponent id={id} ref={ref} {...rest}/>
    )
  }

  wrapper.displayName = 'WithAutoID(' + (WrappedComponent.displayName || WrappedComponent.name || 'Component') + ')'

  return forwardRef(wrapper)
}
