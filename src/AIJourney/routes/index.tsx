import { Route, RouteComponentProps, Switch } from 'react-router-dom'

import { AiJourneyNavbar } from 'AIJourney/components'
import { LandingPage } from 'AIJourney/pages'
import { AiJourneyOnboarding } from 'AIJourney/pages/AiJourneyOnboarding/AiJourneyOnboarding'
import App from 'pages/App'

export function AiJourneyRoutes({ match: { path } }: RouteComponentProps) {
    return (
        <Switch>
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
