import {createDragDropManager} from 'dnd-core'
import {LDClient} from 'launchdarkly-js-client-sdk'
import {LDProvider} from 'launchdarkly-react-client-sdk'
import React, {Component} from 'react'
import {hot} from 'react-hot-loader'
import {Provider} from 'react-redux'
import {Router} from 'react-router-dom'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import Immutable from 'immutable'
import installDevTools from 'immutable-devtools'
import {Store} from 'redux'

import {getLDClient, LDUser} from 'utils/launchDarkly'
import {RootState} from '../state/types'

import history from './history'
import Routes from './routes'

type Props = {
    store: Store<RootState>
}

type State = {
    LDClient?: LDClient
}

if (process.env.NODE_ENV !== 'production') {
    installDevTools(Immutable)
}

const manager = createDragDropManager(HTML5Backend, undefined, undefined)

class Root extends Component<Props, State> {
    state: State = {}

    componentDidMount() {
        const LDClient = getLDClient()

        void LDClient.waitUntilGoalsReady().then(() => {
            this.setState({LDClient})
        })
    }

    render() {
        const {store} = this.props
        const {LDClient} = this.state

        return (
            <Provider store={store}>
                <DndProvider manager={manager}>
                    <LDProvider
                        clientSideID={window.GORGIAS_LAUNCHDARKLY_CLIENT_ID}
                        ldClient={LDClient}
                        reactOptions={{
                            useCamelCaseFlagKeys: false,
                        }}
                        user={LDUser}
                    >
                        <Router history={history}>
                            <Routes />
                        </Router>
                    </LDProvider>
                </DndProvider>
            </Provider>
        )
    }
}

export default hot(module)(Root)
