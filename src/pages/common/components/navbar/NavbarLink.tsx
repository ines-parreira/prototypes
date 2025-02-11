import classnames from 'classnames'
import {LocationDescriptorObject} from 'history'
import React, {useCallback, useMemo, useRef} from 'react'
import {NavLink, NavLinkProps, useRouteMatch, match} from 'react-router-dom'

import css from 'assets/css/navbar.less'
import useScrollActiveItemIntoView from 'hooks/useScrollActiveItemIntoView/useScrollActiveItemIntoView'
import {useReportChartRestrictions} from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'

export type NavbarLinkProps = Pick<
    NavLinkProps,
    'to' | 'exact' | 'children' | 'title' | 'onClick'
> & {
    className?: string
}

const NavbarLink = ({className, exact = false, ...props}: NavbarLinkProps) => {
    const linkRef = useRef<HTMLAnchorElement>(null)
    const path =
        (props.to as LocationDescriptorObject).pathname || (props.to as string)
    const match = useRouteMatch(path)

    const computeIsActive = useCallback(
        (match: match<any>) => {
            if (!match) {
                return false
            }

            return !exact || match.isExact
        },
        [exact]
    )
    const isActive = useMemo(() => {
        return !!match && computeIsActive(match)
    }, [match, computeIsActive])

    useScrollActiveItemIntoView(linkRef, isActive, true)

    const {isRouteRestrictedToCurrentUser} = useReportChartRestrictions()

    if (isRouteRestrictedToCurrentUser(path)) {
        return null
    }

    return (
        <NavLink
            ref={linkRef}
            className={classnames(css.link, className)}
            activeClassName="active"
            isActive={computeIsActive}
            {...props}
        />
    )
}

export default NavbarLink
