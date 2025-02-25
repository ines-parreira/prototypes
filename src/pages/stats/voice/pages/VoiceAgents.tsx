import React from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import moment from 'moment'

import { FeatureFlagKey } from 'config/featureFlags'
import { PaywallConfig, paywallConfigs } from 'config/paywalls'
import { useCleanStatsFiltersWithLogicalOperators } from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import { useGridSize } from 'hooks/useGridSize'
import { ProductType } from 'models/billing/types'
import { FilterKey } from 'models/stat/types'
import withProductEnabledPaywall from 'pages/common/utils/withProductEnabledPaywall'
import { AnalyticsFooter } from 'pages/stats/AnalyticsFooter'
import DEPRECATED_AgentsStatsFilter from 'pages/stats/common/filters/DEPRECATED_AgentsStatsFilter'
import DEPRECATED_IntegrationsStatsFilter from 'pages/stats/common/filters/DEPRECATED_IntegrationsStatsFilter'
import DEPRECATED_PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'
import DEPRECATED_TagsStatsFilter from 'pages/stats/common/filters/DEPRECATED_TagsStatsFilter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import { CustomReportComponent } from 'pages/stats/custom-reports/CustomReportComponent'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import { VoiceAgentsDownloadDataButton } from 'pages/stats/voice/components/VoiceAgentsDownloadDataButton/VoiceAgentsDownloadDataButton'
import { MIN_DATE_FOR_ADVANCED_VOICE_STATS } from 'pages/stats/voice/constants/voiceOverview'
import {
    VoiceAgentsChart,
    VoiceAgentsReportConfig,
} from 'pages/stats/voice/pages/VoiceAgentsReportConfig'
import { AccountFeature } from 'state/currentAccount/types'
import { getPhoneIntegrations } from 'state/integrations/selectors'
import {
    getPageStatsFilters,
    getPageStatsFiltersWithLogicalOperators,
} from 'state/stats/selectors'

import VoicePaywall from '../VoicePaywall'

function VoiceAgents() {
    const phoneIntegrations = useAppSelector(getPhoneIntegrations)
    const statsFilters = useAppSelector(getPageStatsFilters)

    const pageStatsFiltersWithLogicalOperators = useAppSelector(
        getPageStatsFiltersWithLogicalOperators,
    )
    useCleanStatsFiltersWithLogicalOperators(
        pageStatsFiltersWithLogicalOperators,
    )

    const isVoiceAgentsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFiltersVoice]

    const getGridCellSize = useGridSize()

    return (
        <StatsPage
            title={VoiceAgentsReportConfig.reportName}
            titleExtra={
                <>
                    {!isVoiceAgentsNewFilters && (
                        <>
                            <DEPRECATED_IntegrationsStatsFilter
                                value={statsFilters.integrations}
                                integrations={phoneIntegrations}
                                isMultiple
                                variant={'ghost'}
                            />
                            <DEPRECATED_TagsStatsFilter
                                value={statsFilters.tags}
                                variant={'ghost'}
                            />
                            <DEPRECATED_AgentsStatsFilter
                                value={statsFilters.agents}
                                variant={'ghost'}
                            />
                            <DEPRECATED_PeriodStatsFilter
                                initialSettings={{
                                    minDate: moment(
                                        MIN_DATE_FOR_ADVANCED_VOICE_STATS,
                                        'YYYY-MM-DD',
                                    ).toDate(),
                                    maxSpan: 365,
                                }}
                                value={statsFilters.period}
                                variant={'ghost'}
                            />
                        </>
                    )}
                    <VoiceAgentsDownloadDataButton />
                </>
            }
        >
            {isVoiceAgentsNewFilters && (
                <DashboardSection>
                    <DashboardGridCell
                        size={getGridCellSize(12)}
                        className="pb-0"
                    >
                        <FiltersPanelWrapper
                            filterSettingsOverrides={{
                                [FilterKey.Period]: {
                                    initialSettings: {
                                        minDate: moment(
                                            MIN_DATE_FOR_ADVANCED_VOICE_STATS,
                                            'YYYY-MM-DD',
                                        ).toDate(),
                                        maxSpan: 365,
                                    },
                                },
                            }}
                            persistentFilters={
                                VoiceAgentsReportConfig.reportFilters.persistent
                            }
                            optionalFilters={
                                VoiceAgentsReportConfig.reportFilters.optional
                            }
                        />
                    </DashboardGridCell>
                </DashboardSection>
            )}
            <DashboardSection>
                <DashboardGridCell>
                    <CustomReportComponent
                        config={VoiceAgentsReportConfig}
                        chart={VoiceAgentsChart.VoiceAgentsTable}
                    />
                </DashboardGridCell>
            </DashboardSection>
            <AnalyticsFooter />
        </StatsPage>
    )
}

export default withProductEnabledPaywall(
    ProductType.Voice,
    AccountFeature.PhoneNumber,
    VoicePaywall,
    {
        [AccountFeature.PhoneNumber]: {
            ...paywallConfigs[AccountFeature.PhoneNumber],
            pageHeader: VoiceAgentsReportConfig.reportName,
        } as PaywallConfig,
    },
)(VoiceAgents)
