//@flow
import React, {Component} from 'react'
import {hot} from 'react-hot-loader'
import {Provider} from 'react-redux'
import {Router, type BrowserHistory} from 'react-router'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
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
                <DndProvider backend={HTML5Backend}>
                    <Router history={history} routes={routes} />
                </DndProvider>
            </Provider>
        )
    }
}

export default hot(module)(Root)
