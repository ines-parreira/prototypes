import { useEffect } from 'react'

import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom'

import { AiJourneyNavbar } from 'AIJourney/components'
import { STEPS_NAMES } from 'AIJourney/constants'
import {
    Activation,
    AiJourneyOnboarding,
    LandingPage,
    Performance,
    Setup,
    Test,
} from 'AIJourney/pages'
import {
    IntegrationsProvider,
    JourneyProvider,
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
            <Route path={`${path}/:shopName`}>
                <App navbar={AiJourneyNavbar}>
                    <Switch>
                        <Route
                            path={`${path}/:shopName`}
                            exact
                            render={() => <LandingPage />}
                        />
                        <Route
                            path={`${path}/:shopName/setup`}
                            exact
                            render={() => (
                                <AiJourneyOnboarding
                                    step={STEPS_NAMES.SETUP}
                                    stepComponent={<Setup />}
                                />
                            )}
                        />
                        <Route
                            path={`${path}/:shopName/test`}
                            exact
                            render={() => (
                                <AiJourneyOnboarding
                                    step={STEPS_NAMES.TEST}
                                    stepComponent={<Test />}
                                />
                            )}
                        />
                        <Route
                            path={`${path}/:shopName/activate`}
                            exact
                            render={() => (
                                <AiJourneyOnboarding
                                    step={STEPS_NAMES.ACTIVATE}
                                    stepComponent={<Activation />}
                                />
                            )}
                        />
                        <Route
                            path={`${path}/:shopName/performance`}
                            exact
                            render={() => <Performance />}
                        />
                    </Switch>
                </App>
            </Route>
        </Switch>
    )
}

export function AiJourneyRoutes() {
    return (
        <IntegrationsProvider>
            <TokenProvider>
                <JourneyProvider journeyType="cart_abandoned">
                    <AiJourneyBaseRoutes />
                </JourneyProvider>
            </TokenProvider>
        </IntegrationsProvider>
    )
}
