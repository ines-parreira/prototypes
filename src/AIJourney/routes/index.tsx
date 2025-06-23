import { useEffect } from 'react'

import {
    Route,
    RouteComponentProps,
    Switch,
    useHistory,
} from 'react-router-dom'

import { AiJourneyNavbar } from 'AIJourney/components'
import { LandingPage } from 'AIJourney/pages'
import { AiJourneyOnboarding } from 'AIJourney/pages/AiJourneyOnboarding/AiJourneyOnboarding'
import useAllIntegrations from 'hooks/useAllIntegrations'
import App from 'pages/App'

export function AiJourneyRoutes({ match: { path } }: RouteComponentProps) {
    function RedirectToShop() {
        const {
            integrations: shopifyIntegrations,
            isLoading: isLoadingAllIntegrations,
        } = useAllIntegrations('shopify')

        const sortedShopifyIntegrations = [...shopifyIntegrations].sort(
            (a, b) => a.name.localeCompare(b.name),
        )

        const firstStoreIntegration =
            sortedShopifyIntegrations[0]?.meta?.shop_name
        const history = useHistory()

        useEffect(() => {
            if (!isLoadingAllIntegrations && firstStoreIntegration) {
                history.replace(`${path}/${firstStoreIntegration}`)
            }
        }, [isLoadingAllIntegrations, firstStoreIntegration, history])

        return null
    }

    return (
        <Switch>
            <Route path={`${path}/`} exact render={() => <RedirectToShop />} />
            <Route
                path={`${path}/:shopName`}
                exact
                render={() => (
                    <App content={LandingPage} navbar={AiJourneyNavbar} />
                )}
            />
            <Route
                path={`${path}/:shopName`}
                exact
                render={() => (
                    <App content={LandingPage} navbar={AiJourneyNavbar} />
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
                            <AiJourneyOnboarding {...props} step="activation" />
                        )}
                        navbar={AiJourneyNavbar}
                    />
                )}
            />
        </Switch>
    )
}
