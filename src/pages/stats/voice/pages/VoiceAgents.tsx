import React from 'react'
import moment from 'moment'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {PaywallConfig, paywallConfigs} from 'config/paywalls'
import StatsPage from 'pages/stats/StatsPage'
import {AccountFeature} from 'state/currentAccount/types'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import useAppSelector from 'hooks/useAppSelector'
import {
    getPageStatsFilters,
    getPageStatsFiltersWithLogicalOperators,
} from 'state/stats/selectors'
import {useCleanStatsFiltersWithLogicalOperators} from 'hooks/reporting/useCleanStatsFilters'
import DashboardSection from 'pages/stats/DashboardSection'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import ChartCard from 'pages/stats/ChartCard'
import DEPRECATED_PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'
import DEPRECATED_AgentsStatsFilter from 'pages/stats/common/filters/DEPRECATED_AgentsStatsFilter'
import DEPRECATED_TagsStatsFilter from 'pages/stats/common/filters/DEPRECATED_TagsStatsFilter'
import {
    VOICE_AGENTS_PAGE_TITLE,
    VOICE_CALL_ACTIVITY_TITLE,
} from 'pages/stats/voice/constants/voiceAgents'
import {VoiceAgentsTable} from 'pages/stats/voice/components/VoiceAgentsTable/VoiceAgentsTable'
import {MIN_DATE_FOR_ADVANCED_VOICE_STATS} from 'pages/stats/voice/constants/voiceOverview'
import DEPRECATED_IntegrationsStatsFilter from 'pages/stats/common/filters/DEPRECATED_IntegrationsStatsFilter'
import {getPhoneIntegrations} from 'state/integrations/selectors'
import {VoiceAgentsDownloadDataButton} from 'pages/stats/voice/components/VoiceAgentsDownloadDataButton/VoiceAgentsDownloadDataButton'
import withProductEnabledPaywall from 'pages/common/utils/withProductEnabledPaywall'
import {ProductType} from 'models/billing/types'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'
import {FilterComponentKey, FilterKey} from 'models/stat/types'
import {useGridSize} from 'hooks/useGridSize'
import {FeatureFlagKey} from 'config/featureFlags'

function VoiceAgents() {
    const phoneIntegrations = useAppSelector(getPhoneIntegrations)
    const statsFilters = useAppSelector(getPageStatsFilters)
    const pageStatsFiltersWithLogicalOperators = useAppSelector(
        getPageStatsFiltersWithLogicalOperators
    )

    const isVoiceAgentsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFiltersVoice]

    useCleanStatsFiltersWithLogicalOperators(
        pageStatsFiltersWithLogicalOperators
    )

    const getGridCellSize = useGridSize()

    return (
        <StatsPage
            title={VOICE_AGENTS_PAGE_TITLE}
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
                                        'YYYY-MM-DD'
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
                        <FiltersPanel
                            filterSettingsOverrides={{
                                [FilterKey.Period]: {
                                    initialSettings: {
                                        minDate: moment(
                                            MIN_DATE_FOR_ADVANCED_VOICE_STATS,
                                            'YYYY-MM-DD'
                                        ).toDate(),
                                        maxSpan: 365,
                                    },
                                },
                            }}
                            persistentFilters={[FilterKey.Period]}
                            optionalFilters={[
                                FilterComponentKey.PhoneIntegrations,
                                FilterKey.Tags,
                                FilterKey.Agents,
                            ]}
                        />
                    </DashboardGridCell>
                </DashboardSection>
            )}
            <DashboardSection>
                <DashboardGridCell>
                    <ChartCard title={VOICE_CALL_ACTIVITY_TITLE} noPadding>
                        <VoiceAgentsTable />
                    </ChartCard>
                </DashboardGridCell>
            </DashboardSection>
            <AnalyticsFooter />
        </StatsPage>
    )
}

export default withProductEnabledPaywall(
    ProductType.Voice,
    AccountFeature.PhoneNumber,
    undefined,
    {
        [AccountFeature.PhoneNumber]: {
            ...paywallConfigs[AccountFeature.PhoneNumber],
            pageHeader: VOICE_AGENTS_PAGE_TITLE,
        } as PaywallConfig,
    }
)(VoiceAgents)
