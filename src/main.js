import React from 'react'
import {render} from 'react-dom'
import {browserHistory} from 'react-router'

import {store} from './init'
import Root from './pages/Root'

render(
    <Root
        history={browserHistory}
        store={store}
    />,
    document.getElementById('App')
)
