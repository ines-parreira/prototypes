import React, { ReactNode, useCallback, useMemo, useState } from 'react'

import classNames from 'classnames'

import cssNavbar from 'assets/css/navbar.less'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'
import UpgradeIcon from 'pages/common/components/UpgradeIcon'
import { useIsConvertSubscriber } from 'pages/common/hooks/useIsConvertSubscriber'
import ConvertSubscriptionModal from 'pages/convert/common/components/ConvertSubscriptionModal'
import { ReportsIDs } from 'pages/stats/dashboards/constants'
import { ProtectedRoute } from 'pages/stats/report-chart-restrictions/ProtectedRoute'

export type ConvertNavbarLink = {
    label: ReactNode
    to: string
    isPaywalled: boolean
    hasModal: boolean
    requiresSubscriptionToBeSeen: boolean
    extra?: ReactNode
    reportId: ReportsIDs
}

type Props = {
    commonNavLinkProps: Partial<NavbarLinkProps>
}

const ConvertStatsNavbar = ({ commonNavLinkProps }: Props) => {
    const [isSubscriptionModalOpen, setISubscriptionModalOpen] = useState(false)

    const isConvertSubscriber = useIsConvertSubscriber()

    const convertLinks: ConvertNavbarLink[] = useMemo(() => {
        return [
            {
                label: 'Campaigns',
                to: '/app/stats/convert/campaigns',
                isPaywalled: !isConvertSubscriber,
                hasModal: !isConvertSubscriber,
                requiresSubscriptionToBeSeen: false,
                reportId: ReportsIDs.CampaignsReportConfig,
            },
        ]
    }, [isConvertSubscriber])

    const isModalNeeded = useMemo(() => {
        return (
            !isConvertSubscriber &&
            convertLinks.some((convertLink) => convertLink.hasModal)
        )
    }, [isConvertSubscriber, convertLinks])

    const closeModal = () => setISubscriptionModalOpen(false)

    const displayLink = useCallback(
        (convertLink: ConvertNavbarLink) => {
            return (
                isConvertSubscriber || !convertLink.requiresSubscriptionToBeSeen
            )
        },
        [isConvertSubscriber],
    )

    //TODO after Convert reports refactoring is done
    return (
        <>
            {convertLinks.map((convertLink) => (
                <div key={convertLink.to}>
                    {displayLink(convertLink) && (
                        <div
                            className={classNames(
                                cssNavbar['link-wrapper'],
                                cssNavbar.isNested,
                            )}
                        >
                            <ProtectedRoute path={convertLink.reportId}>
                                <NavbarLink
                                    {...commonNavLinkProps}
                                    to={convertLink.to}
                                >
                                    {convertLink.label}
                                    {convertLink.isPaywalled && <UpgradeIcon />}
                                    {!convertLink.isPaywalled &&
                                        convertLink.extra}
                                </NavbarLink>
                            </ProtectedRoute>
                        </div>
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
