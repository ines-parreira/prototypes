import { useEffect } from 'react'

import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom'

import { AiJourneyNavbar } from 'AIJourney/components'
import { AI_JOURNEY_ONBOARDING_STEPS } from 'AIJourney/constants/journeyTypes'
import {
    AiJourneyOnboarding,
    Analytics,
    LandingPage,
    Performance,
    Playground,
} from 'AIJourney/pages'
import { Campaigns } from 'AIJourney/pages/Campaigns/Campaigns'
import {
    IntegrationsProvider,
    JourneyProvider,
    useIntegrations,
} from 'AIJourney/providers'
import App from 'pages/App'

import DefaultStatsFilters from '../../domains/reporting/pages/DefaultStatsFilters'

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
                <JourneyProvider>
                    <App navbar={AiJourneyNavbar}>
                        <Switch>
                            <Route
                                path={`${path}/:shopName`}
                                exact
                                render={() => <LandingPage />}
                            />
                            {AI_JOURNEY_ONBOARDING_STEPS.map(
                                ({ journeyType, steps }) =>
                                    steps.map(
                                        ({ stepName, component }: any) => (
                                            <Route
                                                path={`${path}/:shopName/${journeyType}/${stepName}`}
                                                render={() => (
                                                    <AiJourneyOnboarding
                                                        journeyType={
                                                            journeyType
                                                        }
                                                        step={stepName}
                                                        stepComponent={
                                                            component
                                                        }
                                                    />
                                                )}
                                                key={`${journeyType}-journey-${stepName}`}
                                            />
                                        ),
                                    ),
                            )}
                            <Route
                                path={`${path}/:shopName/performance`}
                                exact
                                render={() => <Performance />}
                            />
                            <Route
                                path={`${path}/:shopName/playground`}
                                exact
                                render={() => <Playground />}
                            />
                            <Route
                                path={`${path}/:shopName/analytics`}
                                exact
                                render={() => (
                                    <DefaultStatsFilters>
                                        <Analytics />
                                    </DefaultStatsFilters>
                                )}
                            />
                            <Route
                                path={`${path}/:shopName/campaigns`}
                                exact
                                render={() => <Campaigns />}
                            />
                            <Route render={() => <LandingPage />} />
                        </Switch>
                    </App>
                </JourneyProvider>
            </Route>
        </Switch>
    )
}

export function AiJourneyRoutes() {
    return (
        <IntegrationsProvider>
            <AiJourneyBaseRoutes />
        </IntegrationsProvider>
    )
}
