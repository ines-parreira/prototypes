import classNames from 'classnames'

import { Badge } from '@gorgias/merchant-ui-kit'

import cssNavbar from 'assets/css/navbar.less'
import { COMMON_NAV_LINK_PROPS } from 'domains/reporting/pages/common/components/StatsNav/StatsNav.utils'
import { ProtectedRoute } from 'domains/reporting/pages/report-chart-restrictions/ProtectedRoute'
import useAppSelector from 'hooks/useAppSelector'
import { ProductType } from 'models/billing/types'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import UpgradeIcon from 'pages/common/components/UpgradeIcon'
import { currentAccountHasProduct } from 'state/billing/selectors'

type Props = {
    to: string
    title: string
    isNew?: boolean
}

function VoiceStatsNavbarItem({ to, title, isNew }: Props) {
    const hasVoiceFeature = useAppSelector(
        currentAccountHasProduct(ProductType.Voice),
    )

    return (
        <div
            className={classNames(
                cssNavbar['link-wrapper'],
                cssNavbar.isNested,
            )}
        >
            <ProtectedRoute path={to}>
                <NavbarLink {...COMMON_NAV_LINK_PROPS} to={to}>
                    {title}
                    {hasVoiceFeature ? (
                        isNew ? (
                            <Badge type={'blue'} className={cssNavbar.badge}>
                                NEW
                            </Badge>
                        ) : null
                    ) : (
                        <UpgradeIcon />
                    )}
                </NavbarLink>
            </ProtectedRoute>
        </div>
    )
}

export default VoiceStatsNavbarItem
