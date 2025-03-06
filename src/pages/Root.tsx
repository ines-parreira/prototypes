import React, { useLayoutEffect, useMemo, useState } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { createDragDropManager } from 'dnd-core'
import Immutable from 'immutable'
import installDevTools from 'immutable-devtools'
import { LDClient } from 'launchdarkly-js-client-sdk'
import { LDProvider } from 'launchdarkly-react-client-sdk'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import { CompatRouter } from 'react-router-dom-v5-compat'
import { Store } from 'redux'

import { RealtimeProvider } from '@gorgias/realtime'

import { appQueryClient } from 'api/queryClient'
import useEffectOnce from 'hooks/useEffectOnce'
import { Main } from 'main/app'
import RoutesWrapper from 'routes'
import activityTracker from 'services/activityTracker'
import { RootState } from 'state/types'
import { envVars, NodeEnv } from 'utils/environment'
import { getLDClient, LDContext } from 'utils/launchDarkly'

import history from './history'

type Props = {
    store: Store<RootState>
}

if (envVars.NODE_ENV !== NodeEnv.Production) {
    installDevTools(Immutable)
}

const manager = createDragDropManager(HTML5Backend, undefined, undefined)

const pubNubWorkerUrl = window.PUBNUB_WORKER_URL

const PNLogVerbosityWhitelistedAccounts = [
    'acme',
    'artemisathletix',
    'yakovishen',
    'walter-test',
]

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

    const pubNubWorkerLogVerbosity = useMemo(
        () =>
            PNLogVerbosityWhitelistedAccounts.includes(
                window.GORGIAS_STATE.currentAccount.domain,
            ),
        [],
    )

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
                        <RealtimeProvider
                            publishKey={window.PUBNUB_PUBLISH_KEY}
                            subscribeKey={window.PUBNUB_SUBSCRIBE_KEY}
                            subscriptionWorkerUrl={pubNubWorkerUrl}
                            subscriptionWorkerUnsubscribeOfflineClients={true}
                            subscriptionWorkerOfflineClientsCheckInterval={5000}
                            subscriptionWorkerLogVerbosity={
                                pubNubWorkerLogVerbosity
                            }
                        >
                            <Router history={history}>
                                <CompatRouter>
                                    <Main>
                                        <RoutesWrapper />
                                    </Main>
                                </CompatRouter>
                            </Router>
                        </RealtimeProvider>
                    </LDProvider>
                </DndProvider>
            </Provider>
        </QueryClientProvider>
    )
}

export default Root
