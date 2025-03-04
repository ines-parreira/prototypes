import React from 'react'

import classNames from 'classnames'

import { Badge } from '@gorgias/merchant-ui-kit'

import cssNavbar from 'assets/css/navbar.less'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'
import { NEW_NAV_LABEL } from 'pages/stats/common/components/StatsNavbarView'
import { ProtectedRoute } from 'pages/stats/report-chart-restrictions/ProtectedRoute'

export const COMMON_NAV_LINK_PROPS: Partial<NavbarLinkProps> = {
    exact: true,
}

export const StatsNavLink = ({
    canduId,
    isNew = false,
    to,
    title,
}: {
    canduId?: string
    isNew?: boolean
    to: string
    title: string
}) => {
    return (
        <ProtectedRoute path={to}>
            <div
                className={classNames(
                    cssNavbar['link-wrapper'],
                    cssNavbar.isNested,
                )}
                data-candu-id={canduId}
            >
                <NavbarLink {...COMMON_NAV_LINK_PROPS} to={to}>
                    {title}
                    {isNew && (
                        <Badge type={'blue'} className={cssNavbar.badge}>
                            {NEW_NAV_LABEL}
                        </Badge>
                    )}
                </NavbarLink>
            </div>
        </ProtectedRoute>
    )
}
