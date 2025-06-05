import { useLayoutEffect, useState } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createDragDropManager } from 'dnd-core'
import Immutable from 'immutable'
import installDevTools from 'immutable-devtools'
import { LDClient } from 'launchdarkly-js-client-sdk'
import { LDProvider } from 'launchdarkly-react-client-sdk'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import { CompatRouter } from 'react-router-dom-v5-compat'
import { Store } from 'redux'

import { appQueryClient } from 'api/queryClient'
import useEffectOnce from 'hooks/useEffectOnce'
import { Main } from 'main/app'
import RealtimeAppProvider from 'providers/realtime/RealtimeAppProvider'
import RoutesWrapper from 'routes'
import activityTracker from 'services/activityTracker'
import { RootState } from 'state/types'
import { envVars, NodeEnv } from 'utils/environment'
import { getLDClient, LDContext } from 'utils/launchDarkly'
import { DndProvider } from 'utils/wrappers/DndProvider'

import history from './history'

type Props = { store: Store<RootState> }

if (envVars.NODE_ENV !== NodeEnv.Production) {
    installDevTools(Immutable)
}

const manager = createDragDropManager(HTML5Backend, undefined, undefined)

const Root = ({ store }: Props) => {
    const [LDClient, setLDClient] = useState<LDClient>()

    useEffectOnce(() => {
        const LDClient = getLDClient()

        void LDClient.waitUntilGoalsReady().then(() => {
            setLDClient(LDClient)
        })
    })

    useLayoutEffect(() => {
        const unlisten = history.listen((location) => {
            const { pathname } = location
            activityTracker.createUserContext({
                accountId: window.GORGIAS_STATE.currentAccount.id,
                userId: window.GORGIAS_STATE.currentUser.id,
                clientId: window.CLIENT_ID,
                path: pathname,
            })
        })

        return unlisten
    })

    return (
        <QueryClientProvider client={appQueryClient}>
            <Provider store={store}>
                <DndProvider manager={manager}>
                    <LDProvider
                        clientSideID={window.GORGIAS_LAUNCHDARKLY_CLIENT_ID}
                        ldClient={LDClient}
                        reactOptions={{ useCamelCaseFlagKeys: false }}
                        context={LDContext}
                    >
                        <RealtimeAppProvider>
                            <Router history={history}>
                                <CompatRouter>
                                    <Main>
                                        <RoutesWrapper />
                                    </Main>
                                </CompatRouter>
                            </Router>
                        </RealtimeAppProvider>
                    </LDProvider>
                </DndProvider>
            </Provider>
            {envVars.NODE_ENV !== NodeEnv.Production && (
                <ReactQueryDevtools
                    initialIsOpen={false}
                    position="bottom-left"
                    panelPosition="bottom"
                    toggleButtonProps={{ style: { marginLeft: '40px' } }}
                />
            )}
        </QueryClientProvider>
    )
}

export default Root
