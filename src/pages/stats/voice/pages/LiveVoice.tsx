import React from 'react'
import {useListLiveCallQueueVoiceCalls} from '@gorgias/api-queries'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import StatsPage from 'pages/stats/StatsPage'
import LiveVoiceFilters from 'pages/stats/voice/components/LiveVoice/LiveVoiceFilters'
import LiveVoiceAgentsSection from 'pages/stats/voice/components/LiveVoice/LiveVoiceAgentsSection'
import LiveVoiceCallTable from 'pages/stats/voice/components/LiveVoice/LiveVoiceCallTable'
import useAppSelector from 'hooks/useAppSelector'
import {getCleanStatsFiltersWithLogicalOperatorsWithTimezone} from 'state/ui/stats/selectors'
import {FilterKey} from 'models/stat/types'

import {ProductType} from 'models/billing/types'
import {AccountFeature} from 'state/currentAccount/types'
import withProductEnabledPaywall from 'pages/common/utils/withProductEnabledPaywall'
import {PaywallConfig, paywallConfigs} from 'config/paywalls'
import {
    LIVE_VOICE_PAGE_TITLE,
    LIVE_VOICE_PAGE_TITLE_DESCRIPTION,
} from '../constants/liveVoice'
import LiveVoiceMetrics from '../components/LiveVoice/LiveVoiceMetrics'
import css from './LiveVoice.less'

function LiveVoice() {
    const {cleanStatsFilters} = useAppSelector(
        getCleanStatsFiltersWithLogicalOperatorsWithTimezone
    )
    const {data: voiceCalls, isLoading} = useListLiveCallQueueVoiceCalls(
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
        }
    )

    return (
        <StatsPage
            title={LIVE_VOICE_PAGE_TITLE}
            description={LIVE_VOICE_PAGE_TITLE_DESCRIPTION}
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
    undefined,
    {
        [AccountFeature.PhoneNumber]: {
            ...paywallConfigs[AccountFeature.PhoneNumber],
            pageHeader: LIVE_VOICE_PAGE_TITLE,
        } as PaywallConfig,
    }
)(LiveVoice)
