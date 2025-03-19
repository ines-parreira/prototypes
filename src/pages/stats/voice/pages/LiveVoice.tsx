import { useListLiveCallQueueVoiceCalls } from '@gorgias/api-queries'

import { PaywallConfig, paywallConfigs } from 'config/paywalls'
import useAppSelector from 'hooks/useAppSelector'
import { ProductType } from 'models/billing/types'
import { FilterKey } from 'models/stat/types'
import withProductEnabledPaywall from 'pages/common/utils/withProductEnabledPaywall'
import { AnalyticsFooter } from 'pages/stats/AnalyticsFooter'
import StatsPage from 'pages/stats/StatsPage'
import LiveVoiceAgentsSection from 'pages/stats/voice/components/LiveVoice/LiveVoiceAgentsSection'
import LiveVoiceCallTable from 'pages/stats/voice/components/LiveVoice/LiveVoiceCallTable'
import LiveVoiceFilters from 'pages/stats/voice/components/LiveVoice/LiveVoiceFilters'
import { AccountFeature } from 'state/currentAccount/types'
import { getCleanStatsFiltersWithLogicalOperatorsWithTimezone } from 'state/ui/stats/selectors'

import LiveVoiceMetrics from '../components/LiveVoice/LiveVoiceMetrics'
import {
    LIVE_VOICE_PAGE_TITLE,
    LIVE_VOICE_PAGE_TITLE_DESCRIPTION,
} from '../constants/liveVoice'
import VoicePaywall from '../VoicePaywall'

import css from './LiveVoice.less'

function LiveVoice() {
    const { cleanStatsFilters } = useAppSelector(
        getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    )
    const { data: voiceCalls, isLoading } = useListLiveCallQueueVoiceCalls(
        {
            agent_ids: cleanStatsFilters?.[FilterKey.Agents]?.values,
            integration_ids:
                cleanStatsFilters?.[FilterKey.Integrations]?.values,
        },
        {
            http: {
                paramsSerializer: {
                    indexes: null,
                },
            },
            query: {
                refetchOnWindowFocus: false,
                select: (data) => data.data.data,
            },
        },
    )

    return (
        <StatsPage
            title={LIVE_VOICE_PAGE_TITLE}
            description={LIVE_VOICE_PAGE_TITLE_DESCRIPTION}
            helpUrl="https://link.gorgias.com/x0q"
        >
            <div className={css.wrapper}>
                <div className={css.content}>
                    <LiveVoiceFilters />
                    <LiveVoiceMetrics
                        isLoadingVoiceCalls={isLoading}
                        liveVoiceCalls={voiceCalls ?? []}
                        cleanStatsFilters={cleanStatsFilters}
                    />
                    <LiveVoiceCallTable
                        isLoading={isLoading}
                        voiceCalls={voiceCalls ?? []}
                    />
                    <AnalyticsFooter useBusinessHoursTimezone />
                </div>
                <div className={css.agentsSection}>
                    <LiveVoiceAgentsSection
                        cleanStatsFilters={cleanStatsFilters}
                    />
                </div>
            </div>
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
            pageHeader: LIVE_VOICE_PAGE_TITLE,
        } as PaywallConfig,
    },
)(LiveVoice)
