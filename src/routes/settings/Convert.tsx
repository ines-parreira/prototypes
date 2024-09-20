import React from 'react'
import {Redirect, Route, Switch, useRouteMatch} from 'react-router-dom'

import {RevenueAddonApiClientProvider} from 'pages/convert/common/hooks/useConvertApi'

export function Convert() {
    const {path} = useRouteMatch()

    return (
        <RevenueAddonApiClientProvider>
            <Switch>
                <Route exact path={`${path}/click-tracking`}>
                    <Redirect to={'/app/convert'} />
                </Route>
                <Route exact path={`${path}/click-tracking/subscribe`}>
                    <Redirect to={'/app/convert'} />
                </Route>
                <Route exact path={`${path}/installations`}>
                    <Redirect to={'/app/convert'} />
                </Route>
                <Route exact path={`${path}/installations/new`}>
                    <Redirect to={'/app/convert'} />
                </Route>
                <Route exact path={`${path}/installations/:bundleId`}>
                    <Redirect to={'/app/convert'} />
                </Route>
            </Switch>
        </RevenueAddonApiClientProvider>
    )
}
