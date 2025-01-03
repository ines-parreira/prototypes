import {useFlags} from 'launchdarkly-react-client-sdk'
import moment, {Moment} from 'moment'
import React, {useState} from 'react'
import {useDispatch} from 'react-redux'
import {useParams} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'
import {AiAgentLayout} from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import {AI_AGENT, OPTIMIZE} from 'pages/aiAgent/constants'
import {IntentTableWidget} from 'pages/aiAgent/insights/IntentTableWidget/IntentTableWidget'
import {PeriodFilter} from 'pages/stats/common/filters/PeriodFilter'
import {
    dateInPastFromStartOfToday,
    endOfLastMonth,
    endOfToday,
    last365DaysStartingFromToday,
    lastWeekDateRange,
    StartDayOfWeek,
    startOfLastMonth,
    startOfMonth,
} from 'pages/stats/common/utils'
import {
    PAST_30_DAYS,
    PAST_60_DAYS,
    PAST_7_DAYS,
    PAST_90_DAYS,
} from 'pages/stats/constants'
import {DrillDownModal} from 'pages/stats/DrillDownModal'
import {getPageStatsFilters} from 'state/stats/selectors'
import {setStatsFilters} from 'state/stats/statsSlice'

import {Level1IntentsPerformance} from '../widgets/Level1IntentsPerformance/Level1IntentsPerformance'
import css from './OptimizeContainer.less'

const HOURS_TO_REMOVE = 72

export const subtractsPeriodWithoutData = (momentDate: Moment) => {
    return momentDate.subtract(HOURS_TO_REMOVE, 'hours')
}

export const subtractsPeriodWithoutDataIfNeeded = (momentDate: Moment) => {
    if (momentDate.isAfter(moment().subtract(HOURS_TO_REMOVE, 'hours'))) {
        return momentDate.subtract(HOURS_TO_REMOVE, 'hours')
    }

    return momentDate
}

export const OptimizeContainer = () => {
    const {shopName} = useParams<{
        shopName: string
    }>()

    const isStandaloneMenuEnabled =
        useFlags()[FeatureFlagKey.ConvAiStandaloneMenu]

    const dispatch = useDispatch()

    const pageStatsFilters = useAppSelector(getPageStatsFilters)

    const [isPeriodFilterSet, setIsPeriodFilterSet] = useState(false)

    useEffectOnce(() => {
        dispatch(
            setStatsFilters({
                period: {
                    start_datetime: moment(
                        subtractsPeriodWithoutData(
                            dateInPastFromStartOfToday(7)
                        )
                    ).format(),
                    end_datetime: moment(
                        subtractsPeriodWithoutData(endOfToday())
                    ).format(),
                },
            })
        )

        setIsPeriodFilterSet(true)
    })

    const getCalendarRangeFilters = (): {[label: string]: [Moment, Moment]} => {
        return {
            'Month to date': [
                startOfMonth(),
                subtractsPeriodWithoutData(endOfToday()),
            ],
            'Last week (start on Sun)': [
                lastWeekDateRange(StartDayOfWeek.Sunday).start,
                subtractsPeriodWithoutDataIfNeeded(
                    lastWeekDateRange(StartDayOfWeek.Sunday).end
                ),
            ],
            'Last week (start on Mon)': [
                lastWeekDateRange(StartDayOfWeek.Monday).start,
                subtractsPeriodWithoutDataIfNeeded(
                    lastWeekDateRange(StartDayOfWeek.Monday).end
                ),
            ],
            'Last month': [
                startOfLastMonth(),
                subtractsPeriodWithoutDataIfNeeded(endOfLastMonth()),
            ],
            [PAST_7_DAYS]: [
                subtractsPeriodWithoutData(dateInPastFromStartOfToday(7)),
                subtractsPeriodWithoutData(endOfToday()),
            ],
            [PAST_30_DAYS]: [
                subtractsPeriodWithoutData(dateInPastFromStartOfToday(30)),
                subtractsPeriodWithoutData(endOfToday()),
            ],
            [PAST_60_DAYS]: [
                subtractsPeriodWithoutData(dateInPastFromStartOfToday(60)),
                subtractsPeriodWithoutData(endOfToday()),
            ],
            [PAST_90_DAYS]: [
                subtractsPeriodWithoutData(dateInPastFromStartOfToday(90)),
                subtractsPeriodWithoutData(endOfToday()),
            ],
            'Past year': [
                subtractsPeriodWithoutData(last365DaysStartingFromToday()),
                subtractsPeriodWithoutData(endOfToday()),
            ],
        }
    }

    return (
        <AiAgentLayout
            shopName={shopName}
            className={css.container}
            title={isStandaloneMenuEnabled ? OPTIMIZE : AI_AGENT}
        >
            <div className={css.section}>
                {isPeriodFilterSet && (
                    <PeriodFilter
                        value={{
                            start_datetime:
                                pageStatsFilters.period.start_datetime,
                            end_datetime: pageStatsFilters.period.end_datetime,
                        }}
                        initialSettings={{
                            maxDate: moment().subtract(
                                HOURS_TO_REMOVE,
                                'hours'
                            ),
                        }}
                        tooltipMessageForPreviousPeriod="There is no data available on this date yet."
                        initialV2Props={{
                            dateRanges: getCalendarRangeFilters(),
                        }}
                    />
                )}

                <Level1IntentsPerformance />
            </div>

            <div className={css.section}>
                <IntentTableWidget
                    title="Intents"
                    description="Explore intents detected from AI Agent tickets to assess performance, review knowledge recommendations, and analyze topics within each intent. "
                    tableTitle="All intents"
                    tableHint={{
                        title: 'List of all intents detected in tickets that involved AI Agent.',
                        link: 'https://docs.gorgias.com/en-US/customer-intents-81924',
                        linkText: 'Learn about intents',
                    }}
                />
            </div>
            <DrillDownModal />
        </AiAgentLayout>
    )
}
