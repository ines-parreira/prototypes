import { useEffect } from 'react'

import {
    Route,
    RouteComponentProps,
    Switch,
    useHistory,
} from 'react-router-dom'

import { AiJourneyNavbar } from 'AIJourney/components'
import { LandingPage, Performance } from 'AIJourney/pages'
import { AiJourneyOnboarding } from 'AIJourney/pages/AiJourneyOnboarding/AiJourneyOnboarding'
import {
    IntegrationsProvider,
    TokenProvider,
    useIntegrations,
} from 'AIJourney/providers'
import App from 'pages/App'

export function AiJourneyRoutes({ match: { path } }: RouteComponentProps) {
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
        <IntegrationsProvider>
            <TokenProvider>
                <Switch>
                    <Route
                        path={`${path}/`}
                        exact
                        render={() => <RedirectToShop />}
                    />
                    <Route
                        path={`${path}/:shopName`}
                        exact
                        render={() => (
                            <App
                                content={LandingPage}
                                navbar={AiJourneyNavbar}
                            />
                        )}
                    />
                    <Route
                        path={`${path}/:shopName/conversation-setup`}
                        exact
                        render={() => (
                            <App
                                content={(props) => (
                                    <AiJourneyOnboarding
                                        {...props}
                                        step="conversation-setup"
                                    />
                                )}
                                navbar={AiJourneyNavbar}
                            />
                        )}
                    />
                    <Route
                        path={`${path}/:shopName/activation`}
                        exact
                        render={() => (
                            <App
                                content={(props) => (
                                    <AiJourneyOnboarding
                                        {...props}
                                        step="activation"
                                    />
                                )}
                                navbar={AiJourneyNavbar}
                            />
                        )}
                    />
                    <Route
                        path={`${path}/:shopName/performance`}
                        exact
                        render={() => (
                            <App
                                content={(props) => (
                                    <Performance {...props} step="activation" />
                                )}
                                navbar={AiJourneyNavbar}
                            />
                        )}
                    />
                </Switch>
            </TokenProvider>
        </IntegrationsProvider>
    )
}
