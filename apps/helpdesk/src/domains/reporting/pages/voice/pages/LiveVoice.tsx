import { useMemo } from 'react'

import { useListLiveCallQueueVoiceCalls } from '@gorgias/helpdesk-queries'
import { useChannel } from '@gorgias/realtime'

import type { PaywallConfig } from 'config/paywalls'
import { paywallConfigs } from 'config/paywalls'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { AnalyticsFooter } from 'domains/reporting/pages/common/AnalyticsFooter'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import LiveVoiceAgentsSection from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceAgentsSection'
import LiveVoiceCallTable from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceCallTable'
import LiveVoiceFilters from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceFilters'
import LiveVoiceMetrics from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceMetrics'
import {
    LIVE_VOICE_PAGE_TITLE,
    LIVE_VOICE_PAGE_TITLE_DESCRIPTION,
} from 'domains/reporting/pages/voice/constants/liveVoice'
import { useLiveVoiceUpdates } from 'domains/reporting/pages/voice/hooks/useLiveVoiceUpdates'
import css from 'domains/reporting/pages/voice/pages/LiveVoice.less'
import VoicePaywall from 'domains/reporting/pages/voice/VoicePaywall'
import { getCleanStatsFiltersWithLogicalOperatorsWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'
import { ProductType } from 'models/billing/types'
import withProductEnabledPaywall from 'pages/common/utils/withProductEnabledPaywall'
import { AccountFeature } from 'state/currentAccount/types'

function LiveVoice() {
    const { cleanStatsFilters } = useAppSelector(
        getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    )
    const params = useMemo(
        () => ({
            agent_ids: cleanStatsFilters?.[FilterKey.Agents]?.values,
            integration_ids:
                cleanStatsFilters?.[FilterKey.Integrations]?.values,
            voice_queue_ids: cleanStatsFilters?.[FilterKey.VoiceQueues]?.values,
        }),
        [cleanStatsFilters],
    )
    const { data: voiceCalls, isLoading } = useListLiveCallQueueVoiceCalls(
        params,
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

    const { channel, handleEvent } = useLiveVoiceUpdates(params)

    useChannel({
        channel,
        onEvent: handleEvent,
    })

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
                    <LiveVoiceAgentsSection params={params} />
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
