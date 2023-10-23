import React from 'react'
import {render} from 'react-dom'

import 'init'

import {store} from 'common/store'
import Root from './pages/Root'
// eslint-disable-next-line
import mobileScrollManager from './services/mobileScrollManager.js'

const container = document.getElementById('App')

if (container) {
    render(<Root store={store} />, container)
}
