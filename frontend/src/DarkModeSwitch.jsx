import React from 'react'
import Icon from './Icon'
import Switch from './Switch'
import Form from './Form'

export default class DarkModeSwitch extends React.Component {
  constructor(props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)

    this.state = {
      value: localStorage.getItem('theme') == 'dark'
    }
  }

  handleChange(e) {
    let value = e.target.checked
    this.setState({value: value})

    if (value) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  render() {
    return (
      <Form>
        <Icon name="fa-sun" className="mr-3 text-gray-400"/>
        <Switch value={this.state.value} onChange={this.handleChange}/>
        <Icon name="fa-moon" className="ml-3 text-gray-400"/>
      </Form>
    )
  }
}
