import { useLayoutEffect } from 'react'

import activityTracker from '@repo/activity-tracker'
import { QueryClientProvider } from '@repo/api-resources'
import { FeatureFlagsProvider } from '@repo/feature-flags'
import { history } from '@repo/routing'
import { envVars, NodeEnv } from '@repo/utils'
import { createDragDropManager } from 'dnd-core'
import Immutable from 'immutable'
import installDevTools from 'immutable-devtools'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import { CompatRouter } from 'react-router-dom-v5-compat'
import type { Store } from 'redux'

import { Main } from 'main/app'
import { CurrentUserRealtimeAvailabilityUpdates } from 'pages/common/components/CurrentUserRealtimeAvailabilityUpdates'
import { RevenueAddonApiClientProvider } from 'pages/convert/common/hooks/useConvertApi'
import { HelpCenterApiClientProvider } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import RoutesWrapper from 'routes'
import { useCanduRouter } from 'routes/hooks/useCanduRouter'
import type { RootState } from 'state/types'
import { DndProvider } from 'utils/wrappers/DndProvider'

type Props = { store: Store<RootState> }

if (envVars.NODE_ENV !== NodeEnv.Production) {
    installDevTools(Immutable)
}

const manager = createDragDropManager(HTML5Backend, undefined, undefined)

const Root = ({ store }: Props) => {
    window.GorgiasCanduRouter = useCanduRouter()

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
        <QueryClientProvider>
            <Provider store={store}>
                <DndProvider manager={manager}>
                    <FeatureFlagsProvider>
                        <RevenueAddonApiClientProvider>
                            <HelpCenterApiClientProvider>
                                <Router history={history}>
                                    <CompatRouter>
                                        <Main>
                                            <CurrentUserRealtimeAvailabilityUpdates />
                                            <RoutesWrapper />
                                        </Main>
                                    </CompatRouter>
                                </Router>
                            </HelpCenterApiClientProvider>
                        </RevenueAddonApiClientProvider>
                    </FeatureFlagsProvider>
                </DndProvider>
            </Provider>
        </QueryClientProvider>
    )
}

export default Root
