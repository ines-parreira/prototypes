import React, {useEffect} from 'react'

import {TicketChannel} from 'business/types/ticket'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {useSearchParam} from 'hooks/useSearchParam'
import {last28DaysStatsFilters} from 'pages/automate/common/utils/last28DaysStatsFilters'
import PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'
import {getStatsFilters} from 'state/stats/selectors'
import {mergeStatsFilters} from 'state/stats/statsSlice'

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
    // const isAutomateOverviewChannelsFilter: boolean | undefined =
    //     useFlags()[FeatureFlagKey.AutomateOverviewChannelsFilter]

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
            {/* Disable channel filter until fix channels for AI Agent events */}
            {/* {isAutomateOverviewChannelsFilter && ( */}
            {/*     <ChannelsStatsFilter */}
            {/*         value={statsFilters.channels} */}
            {/*         channelsFilter={AUTOMATE_ENABLED_CHANNELS} */}
            {/*         variant="ghost" */}
            {/*     /> */}
            {/* )} */}
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
