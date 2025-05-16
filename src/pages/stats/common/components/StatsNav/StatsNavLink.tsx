import classNames from 'classnames'

import { Badge } from '@gorgias/merchant-ui-kit'

import cssNavbar from 'assets/css/navbar.less'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import { ProtectedRoute } from 'pages/stats/report-chart-restrictions/ProtectedRoute'

import { COMMON_NAV_LINK_PROPS, NEW_NAV_LABEL } from './StatsNav.utils'

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
