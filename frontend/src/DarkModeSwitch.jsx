import React, {useEffect, useState} from 'react'
import Icon from './Icon'
import Switch from './Switch'
import Form from './Form'

const DarkModeSwitch = () => {
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return (
    <Form>
      <Icon name="fa-sun" className="mr-3 text-gray-400"/>
      <Switch value={dark} onChange={() => setDark(v => !v)}/>
      <Icon name="fa-moon" className="ml-3 text-gray-400"/>
    </Form>
  )
}

export default DarkModeSwitch
