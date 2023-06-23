import React from 'react'
import {useLocation, useRouteMatch} from 'react-router-dom'

export default function withRouter(Component: any) {
    function ComponentWithRouterProp(props: any) {
        const location = useLocation()
        const match = useRouteMatch()

        return <Component {...props} location={location} match={match} />
    }

    return ComponentWithRouterProp
}
