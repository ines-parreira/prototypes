import React from 'react'
import {render} from 'react-dom'
import {browserHistory} from 'react-router'

import {store} from './init'
import Root from './pages/Root'
// eslint-disable-next-line
import mobileScrollManager from './services/mobileScrollManager'

render(
    <Root
        history={browserHistory}
        store={store}
    />,
    document.getElementById('App')
)
