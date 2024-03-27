import React from 'react'
import classNames from 'classnames'
import useAppSelector from 'hooks/useAppSelector'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'
import cssNavbar from 'assets/css/navbar.less'
import UpgradeIcon from 'pages/common/components/UpgradeIcon'
import {currentAccountHasProduct} from 'state/billing/selectors'
import {ProductType} from 'models/billing/types'

type Props = {
    to: string
    title: string
    commonNavLinkProps: Partial<NavbarLinkProps>
}

function VoiceStatsNavbarItem({to, title, commonNavLinkProps}: Props) {
    const hasVoiceFeature = useAppSelector(
        currentAccountHasProduct(ProductType.Voice)
    )

    return (
        <div
            className={classNames(
                cssNavbar['link-wrapper'],
                cssNavbar.isNested
            )}
        >
            <NavbarLink {...commonNavLinkProps} to={to}>
                {title}
                {!hasVoiceFeature && <UpgradeIcon />}
            </NavbarLink>
        </div>
    )
}

export default VoiceStatsNavbarItem
