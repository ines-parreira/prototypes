//@flow
import 'react-hot-loader'
import React from 'react'
import {render} from 'react-dom'
import {browserHistory} from 'react-router'

import {store} from './init'
import Root from './pages/Root'
// eslint-disable-next-line
import mobileScrollManager from './services/mobileScrollManager'

const container = document.getElementById('App')

if (container) {
    render(
        <Root
            history={browserHistory}
            store={store}
        />,
        container
    )
}

if((module: any).hot) {
    (module: any).hot.accept()
}
