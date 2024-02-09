import React, {ReactNode, useCallback, useMemo, useState} from 'react'
import classNames from 'classnames'
import cssNavbar from 'assets/css/navbar.less'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import ConvertSubscriptionModal from 'pages/settings/new_billing/components/ConvertSubscriptionModal'
import {AccountFeature} from 'state/currentAccount/types'
import UpgradeIcon from 'pages/common/components/UpgradeIcon'
import useAppSelector from 'hooks/useAppSelector'
import {currentAccountHasFeature} from 'state/currentAccount/selectors'
import ConvertNavbarAddOnPaywallNavbarLink from '../ConvertNavbarAddOnPaywallNavbarLink'

export type ConvertNavbarLink = {
    label: ReactNode
    to: string
    isPaywalled: boolean
    hasModal: boolean
    requiresSubscriptionToBeSeen: boolean
    extra?: ReactNode
}

type Props = {
    commonNavLinkProps: Partial<NavbarLinkProps>
}

const ConvertStatsNavbar = ({commonNavLinkProps}: Props) => {
    const [isSubscriptionModalOpen, setISubscriptionModalOpen] = useState(false)

    const isConvertSubscriber = useIsConvertSubscriber()
    const hasRevenueStatisticsFeature = useAppSelector(
        currentAccountHasFeature(AccountFeature.RevenueStatistics)
    )

    const convertLinks: ConvertNavbarLink[] = useMemo(() => {
        return [
            {
                label: 'Overview',
                to: '/app/stats/revenue',
                isPaywalled: !hasRevenueStatisticsFeature,
                hasModal: false,
                requiresSubscriptionToBeSeen: true,
            },
            {
                label: 'Campaigns',
                to: '/app/stats/convert/campaigns',
                isPaywalled: !isConvertSubscriber,
                hasModal: !isConvertSubscriber,
                requiresSubscriptionToBeSeen: false,
            },
        ]
    }, [hasRevenueStatisticsFeature, isConvertSubscriber])

    const isModalNeeded = useMemo(() => {
        return (
            !isConvertSubscriber &&
            convertLinks.some((convertLink) => convertLink.hasModal)
        )
    }, [isConvertSubscriber, convertLinks])

    const closeModal = () => setISubscriptionModalOpen(false)

    const displayPaywallLink = (convertLink: ConvertNavbarLink) =>
        convertLink.isPaywalled &&
        convertLink.hasModal &&
        !convertLink.requiresSubscriptionToBeSeen

    const displayLink = useCallback(
        (convertLink: ConvertNavbarLink) => {
            return (
                isConvertSubscriber || !convertLink.requiresSubscriptionToBeSeen
            )
        },
        [isConvertSubscriber]
    )

    return (
        <>
            {convertLinks.map((convertLink) => (
                <div key={convertLink.to}>
                    {displayPaywallLink(convertLink) ? (
                        <ConvertNavbarAddOnPaywallNavbarLink
                            to={convertLink.to}
                            onSubscribeToAddOnClick={() => {
                                setISubscriptionModalOpen(true)
                            }}
                        >
                            {convertLink.label}
                        </ConvertNavbarAddOnPaywallNavbarLink>
                    ) : (
                        displayLink(convertLink) && (
                            <div
                                className={classNames(
                                    cssNavbar['link-wrapper'],
                                    cssNavbar.isNested
                                )}
                            >
                                <NavbarLink
                                    {...commonNavLinkProps}
                                    to={convertLink.to}
                                >
                                    {convertLink.label}
                                    {convertLink.isPaywalled && <UpgradeIcon />}
                                    {!convertLink.isPaywalled &&
                                        convertLink.extra}
                                </NavbarLink>
                            </div>
                        )
                    )}
                </div>
            ))}

            {isModalNeeded && (
                <ConvertSubscriptionModal
                    canduId={'campaign-list-convert-modal-body'}
                    isOpen={isSubscriptionModalOpen}
                    onClose={closeModal}
                    onSubscribe={closeModal}
                />
            )}
        </>
    )
}

export default ConvertStatsNavbar
