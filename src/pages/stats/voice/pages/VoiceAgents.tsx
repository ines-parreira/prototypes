import React from 'react'
import moment from 'moment'

import {PaywallConfig, paywallConfigs} from 'config/paywalls'
import StatsPage from 'pages/stats/StatsPage'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import {AccountFeature} from 'state/currentAccount/types'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import useAppSelector from 'hooks/useAppSelector'
import {getPageStatsFilters} from 'state/stats/selectors'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import DashboardSection from 'pages/stats/DashboardSection'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import ChartCard from 'pages/stats/ChartCard'
import PeriodStatsFilter from 'pages/stats/PeriodStatsFilter'
import {
    VOICE_AGENTS_PAGE_TITLE,
    VOICE_CALL_ACTIVITY_TITLE,
} from 'pages/stats/voice/constants/voiceAgents'
import {VoiceAgentsTable} from 'pages/stats/voice/components/VoiceAgentsTable/VoiceAgentsTable'
import {MIN_DATE_FOR_ADVANCED_VOICE_STATS} from 'pages/stats/voice/constants/voiceOverview'
import IntegrationsStatsFilter from 'pages/stats/IntegrationsStatsFilter'
import {getPhoneIntegrations} from 'state/integrations/selectors'
import AgentsStatsFilter from 'pages/stats/AgentsStatsFilter'
import {VoiceAgentsDownloadDataButton} from 'pages/stats/voice/components/VoiceAgentsDownloadDataButton/VoiceAgentsDownloadDataButton'

function VoiceAgents() {
    const phoneIntegrations = useAppSelector(getPhoneIntegrations)
    const pageStatsFilters = useAppSelector(getPageStatsFilters)
    useCleanStatsFilters(pageStatsFilters)

    return (
        <StatsPage
            title={VOICE_AGENTS_PAGE_TITLE}
            filters={
                <>
                    <IntegrationsStatsFilter
                        value={pageStatsFilters.integrations}
                        integrations={phoneIntegrations}
                        isMultiple
                        variant={'ghost'}
                    />
                    <AgentsStatsFilter
                        value={pageStatsFilters.agents}
                        variant={'ghost'}
                    />
                    <PeriodStatsFilter
                        initialSettings={{
                            minDate: moment(
                                MIN_DATE_FOR_ADVANCED_VOICE_STATS,
                                'YYYY-MM-DD'
                            ).toDate(),
                            maxSpan: 365,
                        }}
                        value={pageStatsFilters.period}
                        variant={'ghost'}
                    />
                    <VoiceAgentsDownloadDataButton />
                </>
            }
        >
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

export default withFeaturePaywall(AccountFeature.PhoneNumber, undefined, {
    [AccountFeature.PhoneNumber]: {
        ...paywallConfigs[AccountFeature.PhoneNumber],
        pageHeader: VOICE_AGENTS_PAGE_TITLE,
    } as PaywallConfig,
})(VoiceAgents)
