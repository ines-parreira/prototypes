import { useState } from 'react'

import { NavLink } from 'react-router-dom'

import { Navigation } from 'components/Navigation/Navigation'
import UpgradeIcon from 'pages/common/components/UpgradeIcon'
import { useIsConvertSubscriber } from 'pages/common/hooks/useIsConvertSubscriber'
import ConvertSubscriptionModal from 'pages/convert/common/components/ConvertSubscriptionModal'
import { StatsNavbarViewSections } from 'pages/stats/common/components/StatsNavbarViewV2/constants'
import { ReportsIDs } from 'pages/stats/dashboards/constants'
import { ProtectedRoute } from 'pages/stats/report-chart-restrictions/ProtectedRoute'

import css from './ConvertStatsNavbarV2.less'

export const ConvertStatsNavbarV2 = () => {
    const [isSubscriptionModalOpen, setISubscriptionModalOpen] = useState(false)

    const isConvertSubscriber = useIsConvertSubscriber()

    const closeModal = () => setISubscriptionModalOpen(false)

    return (
        <Navigation.Section value={StatsNavbarViewSections.Convert}>
            <Navigation.SectionTrigger data-candu-id="navbar-block-convert">
                Convert
                <Navigation.SectionIndicator />
            </Navigation.SectionTrigger>
            <Navigation.SectionContent className={css.sectionContent}>
                <ProtectedRoute path={ReportsIDs.CampaignsReportConfig}>
                    <Navigation.SectionItem
                        className={css.navigationSectionItem}
                        as={NavLink}
                        to="/app/stats/convert/campaigns"
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
