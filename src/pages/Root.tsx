import {createDragDropManager} from 'dnd-core'
import {LDClient} from 'launchdarkly-js-client-sdk'
import {LDProvider} from 'launchdarkly-react-client-sdk'
import React, {useState} from 'react'
import {Provider} from 'react-redux'
import {Router} from 'react-router-dom'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import Immutable from 'immutable'
import installDevTools from 'immutable-devtools'
import {Store} from 'redux'
import {QueryClientProvider} from '@tanstack/react-query'

import {appQueryClient} from 'api/queryClient'
import {Core} from 'core/app'
import {RootState} from 'state/types'
import {getLDClient, LDContext} from 'utils/launchDarkly'
import {envVars, NodeEnv} from 'utils/environment'
import useEffectOnce from 'hooks/useEffectOnce'

import history from './history'
import Routes from './routes'

type Props = {
    store: Store<RootState>
}

if (envVars.NODE_ENV !== NodeEnv.Production) {
    installDevTools(Immutable)
}

const manager = createDragDropManager(HTML5Backend, undefined, undefined)

const Root = ({store}: Props) => {
    const [LDClient, setLDClient] = useState<LDClient>()

    useEffectOnce(() => {
        const LDClient = getLDClient()

        void LDClient.waitUntilGoalsReady().then(() => {
            setLDClient(LDClient)
        })
    })

    return (
        <QueryClientProvider client={appQueryClient}>
            <Provider store={store}>
                <DndProvider manager={manager}>
                    <LDProvider
                        clientSideID={window.GORGIAS_LAUNCHDARKLY_CLIENT_ID}
                        ldClient={LDClient}
                        reactOptions={{
                            useCamelCaseFlagKeys: false,
                        }}
                        context={LDContext}
                    >
                        <Router history={history}>
                            <Core>
                                <Routes />
                            </Core>
                        </Router>
                    </LDProvider>
                </DndProvider>
            </Provider>
        </QueryClientProvider>
    )
}

export default Root
