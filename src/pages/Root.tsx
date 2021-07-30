import React, {Component} from 'react'
import {hot} from 'react-hot-loader'
import {Provider} from 'react-redux'
import {Router} from 'react-router-dom'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import Immutable from 'immutable'
import installDevTools from 'immutable-devtools'
import {Store} from 'redux'

import {RootState} from '../state/types'

import history from './history'
import Routes from './routes'

type Props = {
    store: Store<RootState>
}

if (process.env.NODE_ENV !== 'production') {
    installDevTools(Immutable)
}

class Root extends Component<Props> {
    render() {
        const {store} = this.props
        return (
            <Provider store={store}>
                <DndProvider backend={HTML5Backend}>
                    <Router history={history}>
                        <Routes />
                    </Router>
                </DndProvider>
            </Provider>
        )
    }
}

export default hot(module)(Root)
