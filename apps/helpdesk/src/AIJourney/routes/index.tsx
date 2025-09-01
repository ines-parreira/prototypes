import { useEffect } from 'react'

import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom'

import { AiJourneyNavbar } from 'AIJourney/components'
import { STEPS_NAMES } from 'AIJourney/constants'
import { AiJourneyOnboarding, LandingPage, Performance } from 'AIJourney/pages'
import {
    IntegrationsProvider,
    TokenProvider,
    useIntegrations,
} from 'AIJourney/providers'
import App from 'pages/App'

function AiJourneyBaseRoutes() {
    const { path } = useRouteMatch()

    function RedirectToShop() {
        const { integrations, isLoading } = useIntegrations()
        const sortedShopifyIntegrations = [...integrations].sort((a, b) =>
            a.name.localeCompare(b.name),
        )
        const firstStoreName = sortedShopifyIntegrations[0]?.name
        const history = useHistory()

        useEffect(() => {
            if (!isLoading && firstStoreName) {
                history.replace(`${path}/${firstStoreName}`)
            }
        }, [isLoading, firstStoreName, history])

        return null
    }

    return (
        <Switch>
            <Route path={`${path}/`} exact render={() => <RedirectToShop />} />
            <Route
                path={`${path}/:shopName`}
                exact
                render={() => <LandingPage />}
            />
            <Route
                path={`${path}/:shopName/conversation-setup`}
                exact
                render={() => (
                    <AiJourneyOnboarding
                        step={STEPS_NAMES.CONVERSATION_SETUP}
                    />
                )}
            />
            <Route
                path={`${path}/:shopName/activation`}
                exact
                render={() => (
                    <AiJourneyOnboarding step={STEPS_NAMES.ACTIVATION} />
                )}
            />
            <Route
                path={`${path}/:shopName/performance`}
                exact
                render={() => <Performance />}
            />
        </Switch>
    )
}

export function AiJourneyRoutes() {
    return (
        <IntegrationsProvider>
            <TokenProvider>
                <App navbar={AiJourneyNavbar}>
                    <AiJourneyBaseRoutes />
                </App>
            </TokenProvider>
        </IntegrationsProvider>
    )
}
