import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {TicketChannel} from 'business/types/ticket'
import {FeatureFlagKey} from 'config/featureFlags'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import ChannelsStatsFilter from 'pages/stats/ChannelsStatsFilter'
import PeriodStatsFilter from 'pages/stats/PeriodStatsFilter'
import {getStatsFilters} from 'state/stats/selectors'

export const AutomateOverviewFilters = () => {
    const isAutomateOverviewChannelsFilter: boolean | undefined =
        useFlags()[FeatureFlagKey.AutomateOverviewChannelsFilter]

    const statsFilters = useAppSelector(getStatsFilters)
    useCleanStatsFilters(statsFilters)

    return (
        <>
            {isAutomateOverviewChannelsFilter && (
                <ChannelsStatsFilter
                    value={statsFilters.channels}
                    channelsFilter={[
                        TicketChannel.Chat,
                        TicketChannel.HelpCenter,
                        TicketChannel.ContactForm,
                        TicketChannel.Email,
                    ]}
                    variant="ghost"
                />
            )}
            <PeriodStatsFilter
                initialSettings={{
                    maxSpan: 365,
                }}
                value={statsFilters.period}
                variant="ghost"
            />
        </>
    )
}
