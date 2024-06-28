import classNames from 'classnames'
import React from 'react'

import AutomateNavbarPaywallNavbarLink from 'pages/automate/common/components/AutomateNavbarPaywallNavbarLink'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'
import cssNavbar from 'assets/css/navbar.less'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'

import {
    ROUTE_AUTOMATE_OVERVIEW,
    PAGE_TITLE_OVERVIEW,
    PAGE_TITLE_PERFORMANCE_BY_FEATURES,
    ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES,
} from './constants'

type Props = {
    commonNavLinkProps: Partial<NavbarLinkProps>
}

const OVERVIEW_PATH = `/app/stats/${ROUTE_AUTOMATE_OVERVIEW}`
const PERFORMANCE_BY_FEATURE_PATH = `/app/stats/${ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES}`

export default function AutomateStatsNavbar({commonNavLinkProps}: Props) {
    const hasAutomate = useAppSelector(getHasAutomate)

    return (
        <div className={cssNavbar.menu}>
            {!hasAutomate ? (
                <AutomateNavbarPaywallNavbarLink to={OVERVIEW_PATH} isNested>
                    {PAGE_TITLE_OVERVIEW}
                </AutomateNavbarPaywallNavbarLink>
            ) : (
                <>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                        data-candu-id="statistics-automate-link-overview"
                    >
                        <NavbarLink {...commonNavLinkProps} to={OVERVIEW_PATH}>
                            {PAGE_TITLE_OVERVIEW}
                        </NavbarLink>
                    </div>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                        data-candu-id="statistics-automate-performance-by-feature"
                    >
                        <NavbarLink
                            {...commonNavLinkProps}
                            to={PERFORMANCE_BY_FEATURE_PATH}
                        >
                            {PAGE_TITLE_PERFORMANCE_BY_FEATURES}
                        </NavbarLink>
                    </div>
                </>
            )}
        </div>
    )
}
