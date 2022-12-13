import React, {useMemo} from 'react'
import {
    RouteProps,
    Route,
    Redirect,
    useLocation,
    useRouteMatch,
} from 'react-router-dom'

type Props = Omit<RouteProps, 'path'> & {
    path: string
    isDeprecated?: boolean
    redirectTo: string
}

const MaybeDeprecatedRoute = ({
    isDeprecated = false,
    redirectTo: redirectToProp,
    ...props
}: Props) => {
    const {path, exact} = props

    const {pathname} = useLocation()
    const match = useRouteMatch(path)

    const redirectTo = useMemo(() => {
        if (match && !exact) {
            return redirectToProp.concat(pathname.substring(match.path.length))
        }

        return redirectToProp
    }, [match, exact, pathname, redirectToProp])

    if (isDeprecated) {
        return <Redirect exact to={redirectTo} from={path} />
    }

    return <Route {...props} />
}

export default MaybeDeprecatedRoute
