import React, {useMemo} from 'react'
import {
    RouteProps,
    Redirect,
    useLocation,
    useRouteMatch,
    generatePath,
} from 'react-router-dom'

export type DeprecatedRouteProps = Omit<RouteProps, 'path'> & {
    path: string
    redirectTo: string
}

const DeprecatedRoute = ({
    redirectTo: redirectToProp,
    ...props
}: DeprecatedRouteProps) => {
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

    return <Redirect exact to={redirectTo} from={path} />
}

export default DeprecatedRoute
