//@flow
import React, {Component} from 'react'
import {hot} from 'react-hot-loader'
import {Provider} from 'react-redux'
import {Router, type BrowserHistory} from 'react-router'
import Immutable from 'immutable'
import installDevTools from 'immutable-devtools'

import type {stateType} from '../state/types'

import routes from './routes'

type Props = {
    store: stateType,
    history: BrowserHistory,
}

if (process.env.NODE_ENV !== 'production') {
    installDevTools(Immutable)
}

class Root extends Component<Props> {
    render() {
        const {store, history} = this.props
        return (
            <Provider store={store}>
                <Router
                    history={history}
                    routes={routes}
                />
            </Provider>
        )
    }
}

export default hot(module)(Root)
