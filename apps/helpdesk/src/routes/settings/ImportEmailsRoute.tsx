import {
    Redirect,
    Route,
    Switch,
    useLocation,
    useRouteMatch,
} from 'react-router-dom'

export function ImportEmailsRoute() {
    const { path } = useRouteMatch()
    const location = useLocation()

    return (
        <Switch>
            <Route path={`${path}/`} exact>
                {/* Import auth callbacks still land on the legacy route. Keep this
                    shim until the upstream callback target is updated. */}
                <Redirect
                    to={{
                        pathname: '/app/settings/historical-imports',
                        search: location.search,
                    }}
                />
            </Route>
        </Switch>
    )
}
