import classNames from 'classnames'
import React, {ReactNode} from 'react'
import _kebabCase from 'lodash/kebabCase'

import {useFlags} from 'launchdarkly-react-client-sdk'
import AutomateNavbarPaywallNavbarLink from 'pages/automate/common/components/AutomateNavbarPaywallNavbarLink'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'
import cssNavbar from 'assets/css/navbar.less'
import useAppSelector from 'hooks/useAppSelector'
import {FeatureFlagKey} from 'config/featureFlags'
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
    const isNewAutomateEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.NewAutomationAddon]
    const automateRoutes: {
        label: ReactNode
        to: string
        text: string
    }[] = [
        {
            label: isNewAutomateEnabled
                ? PAGE_TITLE_PERFORMANCE_BY_FEATURES
                : PAGE_TITLE_OVERVIEW,
            to: PERFORMANCE_BY_FEATURE_PATH,
            text: isNewAutomateEnabled
                ? PAGE_TITLE_PERFORMANCE_BY_FEATURES
                : PAGE_TITLE_OVERVIEW,
        },
    ]
    isNewAutomateEnabled &&
        automateRoutes.unshift({
            label: PAGE_TITLE_OVERVIEW,
            to: OVERVIEW_PATH,
            text: PAGE_TITLE_OVERVIEW,
        })
    return (
        <div className={cssNavbar.menu}>
            {!hasAutomate ? (
                <>
                    <AutomateNavbarPaywallNavbarLink
                        to={OVERVIEW_PATH}
                        key={ROUTE_AUTOMATE_OVERVIEW}
                        isNested
                    >
                        {PAGE_TITLE_OVERVIEW}
                    </AutomateNavbarPaywallNavbarLink>
                </>
            ) : (
                <>
                    {automateRoutes.map((automateRoute) => (
                        <div
                            key={automateRoute.to}
                            className={classNames(
                                cssNavbar['link-wrapper'],
                                cssNavbar.isNested
                            )}
                            data-candu-id={`statistics-automate-link-${_kebabCase(
                                automateRoute.text
                            )}`}
                        >
                            <NavbarLink
                                {...commonNavLinkProps}
                                to={automateRoute.to}
                            >
                                {automateRoute.label}
                            </NavbarLink>
                        </div>
                    ))}
                </>
            )}
        </div>
    )
}
