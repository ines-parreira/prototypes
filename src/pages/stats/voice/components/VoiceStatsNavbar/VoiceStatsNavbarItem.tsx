import React from 'react'

import classNames from 'classnames'

import { Badge } from '@gorgias/merchant-ui-kit'

import cssNavbar from 'assets/css/navbar.less'
import useAppSelector from 'hooks/useAppSelector'
import { ProductType } from 'models/billing/types'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'
import UpgradeIcon from 'pages/common/components/UpgradeIcon'
import { currentAccountHasProduct } from 'state/billing/selectors'

type Props = {
    to: string
    title: string
    commonNavLinkProps: Partial<NavbarLinkProps>
    isNew?: boolean
}

function VoiceStatsNavbarItem({ to, title, commonNavLinkProps, isNew }: Props) {
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
            <NavbarLink {...commonNavLinkProps} to={to}>
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
        </div>
    )
}

export default VoiceStatsNavbarItem
