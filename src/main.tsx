import 'react-hot-loader'
import React from 'react'
import {render} from 'react-dom'
import {browserHistory} from 'react-router'

import {store} from './init.js'
import Root from './pages/Root.js'
// eslint-disable-next-line
import mobileScrollManager from './services/mobileScrollManager.js'

const container = document.getElementById('App')

if (container) {
    render(<Root history={browserHistory} store={store} />, container)
}

if (module.hot) {
    module.hot.accept()
}
