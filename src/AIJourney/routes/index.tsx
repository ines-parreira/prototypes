import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom'

import { LandingPage } from 'AIJourney/pages'
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
        </Switch>
    )
}
