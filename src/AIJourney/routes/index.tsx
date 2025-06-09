import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom'

import { LandingPage } from 'AIJourney/pages'
import { AiJourneyOnboarding } from 'AIJourney/pages/AiJourneyOnboarding/AiJourneyOnboarding'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import App from 'pages/App'

export function AiJourneyRoutes({ match: { path } }: RouteComponentProps) {
    const isAiJourneyEnabled = useFlag(FeatureFlagKey.AiJourneyEnabled)

    if (!isAiJourneyEnabled) {
        return <Redirect to={`/app`} />
    }

    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={() => <App content={LandingPage} />}
            />
            <Route
                path={`${path}/conversation-setup`}
                exact
                render={() => (
                    <App
                        content={(props) => (
                            <AiJourneyOnboarding
                                {...props}
                                step="conversation-setup"
                            />
                        )}
                    />
                )}
            />
            <Route
                path={`${path}/activation`}
                exact
                render={() => (
                    <App
                        content={(props) => (
                            <AiJourneyOnboarding {...props} step="activation" />
                        )}
                    />
                )}
            />
        </Switch>
    )
}
