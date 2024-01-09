import classNames from 'classnames'
import React, {ReactNode} from 'react'

import {useFlags} from 'launchdarkly-react-client-sdk'
import AutomateNavbarPaywallNavbarLink from 'pages/automate/common/components/AutomateNavbarPaywallNavbarLink'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'
import cssNavbar from 'assets/css/navbar.less'
import useAppSelector from 'hooks/useAppSelector'
import {
    getIntegrationsList,
    hasIntegrationOfTypes,
} from 'state/integrations/selectors'
import {FeatureFlagKey} from 'config/featureFlags'
import {getHasAutomate} from 'state/billing/selectors'
import {Category} from 'models/integration/types'
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
    const integrationsList = useAppSelector(getIntegrationsList)

    const hasEcommerceIntegerations = useAppSelector(
        hasIntegrationOfTypes(
            integrationsList
                .filter((integration) =>
                    integration.categories.includes(Category.ECOMMERCE)
                )
                .map((integration) => integration.type)
        )
    )

    const automateRoutes: {
        label: ReactNode
        to: string
    }[] = [
        {
            label: isNewAutomateEnabled
                ? PAGE_TITLE_PERFORMANCE_BY_FEATURES
                : PAGE_TITLE_OVERVIEW,
            to: PERFORMANCE_BY_FEATURE_PATH,
        },
    ]
    isNewAutomateEnabled &&
        automateRoutes.unshift({
            label: (
                <>
                    {PAGE_TITLE_OVERVIEW}
                    {hasAutomate && hasEcommerceIntegerations && (
                        <Badge
                            type={ColorType.Blue}
                            className={cssNavbar.badge}
                        >
                            NEW
                        </Badge>
                    )}
                </>
            ),
            to: OVERVIEW_PATH,
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
