import { Route, Switch, useRouteMatch } from 'react-router-dom'

import { AiJourneyNavbar } from 'AIJourney/components'
import { AI_JOURNEY_ONBOARDING_STEPS } from 'AIJourney/constants/journeyTypes'
import {
    AiJourneyOnboarding,
    Analytics,
    Flows,
    Playground,
} from 'AIJourney/pages'
import { Campaigns } from 'AIJourney/pages/Campaigns/Campaigns'
import { JourneyProvider } from 'AIJourney/providers'
import App from 'pages/App'

import DefaultStatsFilters from '../../domains/reporting/pages/DefaultStatsFilters'
import { RedirectToShop } from './RedirectToShop'

function AiJourneyBaseRoutes() {
    const { path } = useRouteMatch()

    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={() => <RedirectToShop basePath={path} />}
            />
            <Route path={`${path}/:shopName`}>
                <JourneyProvider>
                    <App navbar={AiJourneyNavbar}>
                        <Switch>
                            <Route
                                path={`${path}/:shopName`}
                                exact
                                render={() => (
                                    <DefaultStatsFilters>
                                        <Analytics />
                                    </DefaultStatsFilters>
                                )}
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
                                path={`${path}/:shopName/flows`}
                                exact
                                render={() => (
                                    <DefaultStatsFilters>
                                        <Flows />
                                    </DefaultStatsFilters>
                                )}
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
                                render={() => (
                                    <DefaultStatsFilters>
                                        <Campaigns />
                                    </DefaultStatsFilters>
                                )}
                            />
                            <Route
                                render={() => (
                                    <DefaultStatsFilters>
                                        <Analytics />
                                    </DefaultStatsFilters>
                                )}
                            />
                        </Switch>
                    </App>
                </JourneyProvider>
            </Route>
        </Switch>
    )
}

export function AiJourneyRoutes() {
    return <AiJourneyBaseRoutes />
}
