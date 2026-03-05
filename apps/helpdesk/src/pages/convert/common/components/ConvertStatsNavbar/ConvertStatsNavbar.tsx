import { useState } from 'react'

import { NavLink } from 'react-router-dom'

import { Navigation } from 'components/Navigation/Navigation'
import { StatsNavbarViewSections } from 'domains/reporting/pages/common/components/StatsNavbarView/constants'
import { ProtectedRoute } from 'domains/reporting/pages/report-chart-restrictions/ProtectedRoute'
import UpgradeIcon from 'pages/common/components/UpgradeIcon'
import { useIsConvertSubscriber } from 'pages/common/hooks/useIsConvertSubscriber'
import css from 'pages/convert/common/components/ConvertStatsNavbar/ConvertStatsNavbar.less'
import ConvertSubscriptionModal from 'pages/convert/common/components/ConvertSubscriptionModal'
import { STATS_ROUTES } from 'routes/constants'
import { analyticsSections } from 'routes/layout/products/analytics'

const CAMPAIGNS_PATH = `/app/stats/${STATS_ROUTES.CONVERT_CAMPAIGNS}`

export const ConvertStatsNavbar = () => {
    const [isSubscriptionModalOpen, setISubscriptionModalOpen] = useState(false)

    const isConvertSubscriber = useIsConvertSubscriber()

    const closeModal = () => setISubscriptionModalOpen(false)

    return (
        <Navigation.Section
            value={analyticsSections[StatsNavbarViewSections.Convert].id}
            icon={analyticsSections[StatsNavbarViewSections.Convert].icon}
        >
            <Navigation.SectionTrigger
                data-candu-id="navbar-block-convert"
                icon={analyticsSections[StatsNavbarViewSections.Convert].icon}
            >
                <span className={css.sectionTriggerTitle}>Convert</span>
                <Navigation.SectionIndicator />
            </Navigation.SectionTrigger>
            <Navigation.SectionContent className={css.sectionContent}>
                <ProtectedRoute path={CAMPAIGNS_PATH}>
                    <Navigation.SectionItem
                        className={css.navigationSectionItem}
                        as={NavLink}
                        to={CAMPAIGNS_PATH}
                        displayType="indent"
                    >
                        Campaigns
                        {!isConvertSubscriber && <UpgradeIcon />}
                    </Navigation.SectionItem>
                </ProtectedRoute>
            </Navigation.SectionContent>

            {!isConvertSubscriber && (
                <ConvertSubscriptionModal
                    canduId={'campaign-list-convert-modal-body'}
                    isOpen={isSubscriptionModalOpen}
                    onClose={closeModal}
                    onSubscribe={closeModal}
                />
            )}
        </Navigation.Section>
    )
}
