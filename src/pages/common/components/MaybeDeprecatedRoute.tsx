import React, {useMemo} from 'react'
import {
    RouteProps,
    Route,
    Redirect,
    useLocation,
    useRouteMatch,
    generatePath,
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

    const {pathname, search} = useLocation()
    const match = useRouteMatch(path)

    const redirectTo = useMemo(() => {
        const redirectTo =
            match && !exact
                ? redirectToProp.concat(pathname.substring(match.path.length))
                : redirectToProp

        return generatePath(redirectTo.concat(search), match?.params)
    }, [match, exact, pathname, search, redirectToProp])

    if (isDeprecated) {
        return <Redirect exact to={redirectTo} from={path} />
    }

    return <Route {...props} />
}

export default MaybeDeprecatedRoute
