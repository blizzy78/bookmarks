import React from 'react'

export default function withAutoID(WrappedComponent) {
  class WithAutoID extends React.Component {
    constructor(props) {
      super(props)

      this.id = 'c-' + new Date().getTime() + '-' + Math.floor(Math.random() * 999999)
    }

    render() {
      return <WrappedComponent id={this.id} {...this.props}/>
    }
  }

  WithAutoID.displayName = 'WithAutoID(' + (WrappedComponent.displayName || WrappedComponent.name || 'Component') + ')'

  const forward = React.forwardRef((props, ref) => <WithAutoID forwardedRef={ref} {...props}/>)
  forward.displayName = WithAutoID.displayName

  return forward
}
