import {
    Redirect,
    Route,
    Switch,
    useLocation,
    useRouteMatch,
} from 'react-router-dom'

export function ImportZendeskRoute() {
    const { path } = useRouteMatch()
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)

    if (!searchParams.has('activeTab')) {
        searchParams.set('activeTab', 'import-zendesk')
    }

    return (
        <Switch>
            <Route path={`${path}/`} exact>
                {/* Legacy import entrypoints still resolve to this route. Keep this
                    shim until all upstream redirects target historical-imports. */}
                <Redirect
                    to={{
                        pathname: '/app/settings/historical-imports',
                        search: `?${searchParams.toString()}`,
                    }}
                />
            </Route>
        </Switch>
    )
}
