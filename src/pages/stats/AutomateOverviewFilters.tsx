import React, {useEffect} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import useAppDispatch from 'hooks/useAppDispatch'
import {useSearchParam} from 'hooks/useSearchParam'
import {last28DaysStatsFilters} from 'pages/automate/common/utils/last28DaysStatsFilters'
import {TicketChannel} from 'business/types/ticket'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import ChannelsStatsFilter from 'pages/stats/common/filters/DEPRECATED_ChannelsStatsFilter'
import PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'
import {mergeStatsFilters} from 'state/stats/statsSlice'
import {getStatsFilters} from 'state/stats/selectors'

export const AUTOMATE_ENABLED_CHANNELS = [
    TicketChannel.Chat,
    TicketChannel.HelpCenter,
    TicketChannel.ContactForm,
    TicketChannel.Email,
]

export const AutomateOverviewFilters = ({
    isAnalyticsNewFiltersAutomate = false,
}: {
    isAnalyticsNewFiltersAutomate?: boolean
}) => {
    const isAutomateOverviewChannelsFilter: boolean | undefined =
        useFlags()[FeatureFlagKey.AutomateOverviewChannelsFilter]

    const dispatch = useAppDispatch()
    const statsFilters = useAppSelector(getStatsFilters)
    const [sourceSearchParam, setSourceSearchParam] = useSearchParam('source')

    useEffect(() => {
        if (sourceSearchParam === 'automate') {
            dispatch(mergeStatsFilters(last28DaysStatsFilters()))
            setSourceSearchParam(null)
        }
    }, [dispatch, sourceSearchParam, setSourceSearchParam])

    return isAnalyticsNewFiltersAutomate ? null : (
        <>
            {isAutomateOverviewChannelsFilter && (
                <ChannelsStatsFilter
                    value={statsFilters.channels}
                    channelsFilter={AUTOMATE_ENABLED_CHANNELS}
                    variant="ghost"
                />
            )}
            <PeriodStatsFilter
                initialSettings={{
                    maxSpan: 365,
                }}
                value={
                    sourceSearchParam === 'automate'
                        ? last28DaysStatsFilters().period
                        : statsFilters.period
                }
                variant="ghost"
            />
        </>
    )
}
