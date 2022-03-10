import React, {useMemo} from 'react'
import {fromJS, Map} from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import {getStatsFilters} from 'state/stats/selectors'
import {
    INTENTS_BREAKDOWN_PER_DAY,
    INTENTS_OCCURRENCE,
    INTENTS_OVERVIEW,
    stats as statsConfig,
} from 'config/stats'
import {
    OneDimensionalChart,
    StatsFilters,
    TwoDimensionalChart,
} from 'models/stat/types'
import {TicketChannel} from 'business/types/ticket'

import ChannelsStatsFilter from './ChannelsStatsFilter'
import PeriodStatsFilter from './PeriodStatsFilter'
import StatsPage from './StatsPage'
import useStatResource from './useStatResource'
import KeyMetricStatWrapper from './KeyMetricStatWrapper'
import KeyMetricStat from './common/components/charts/KeyMetricStat/KeyMetricStat'
import StatWrapper from './StatWrapper'
import {BarStat} from './common/components/charts/BarStat'
import TableStat from './common/components/charts/TableStat/TableStat'

const AUTOMATION_INTENTS_STAT_NAME = 'automation-intents'
const AUTOMATION_INTENTS_CHANNELS = [
    TicketChannel.Api,
    TicketChannel.Chat,
    TicketChannel.Email,
    TicketChannel.Facebook,
    TicketChannel.FacebookMention,
    TicketChannel.FacebookMessenger,
    TicketChannel.InstagramAdComment,
    TicketChannel.InstagramComment,
    TicketChannel.Phone,
    TicketChannel.Sms,
]

export default function AutomationIntents() {
    const statsFilters = useAppSelector(getStatsFilters)

    const pageStatsFilters = useMemo<StatsFilters>(() => {
        const {channels, period} = statsFilters
        return {channels, period}
    }, [statsFilters])

    const [intentsOverview, isFetchingIntentsOverview] =
        useStatResource<OneDimensionalChart>({
            statName: AUTOMATION_INTENTS_STAT_NAME,
            resourceName: INTENTS_OVERVIEW,
            statsFilters: pageStatsFilters,
        })

    const immutableIntentsOverview = useMemo(() => {
        return fromJS(intentsOverview || {}) as Map<any, any>
    }, [intentsOverview])

    const [intentsBreakdownPerDay, isFetchingIntentsBreakdownPerDay] =
        useStatResource<TwoDimensionalChart>({
            statName: AUTOMATION_INTENTS_STAT_NAME,
            resourceName: INTENTS_BREAKDOWN_PER_DAY,
            statsFilters: pageStatsFilters,
        })

    const [intentsOccurrence, isFetchingIntentsOccurrence] =
        useStatResource<TwoDimensionalChart>({
            statName: AUTOMATION_INTENTS_STAT_NAME,
            resourceName: INTENTS_OCCURRENCE,
            statsFilters: pageStatsFilters,
        })

    return (
        <StatsPage
            title="Intents"
            description="Intents statistics on ticket messages give you an overview of the most reccurrent issues your customers face.
            Intents can be used in rules and macros to automate your ticket-reply workflow."
            helpUrl="https://docs.gorgias.com/intents-sentiments/customer-intents"
            filters={
                pageStatsFilters && (
                    <>
                        <ChannelsStatsFilter
                            value={pageStatsFilters.channels}
                            channels={AUTOMATION_INTENTS_CHANNELS}
                        />
                        <PeriodStatsFilter value={pageStatsFilters.period} />
                    </>
                )
            }
        >
            {pageStatsFilters && (
                <>
                    <KeyMetricStatWrapper>
                        <KeyMetricStat
                            data={immutableIntentsOverview.getIn([
                                'data',
                                'data',
                            ])}
                            meta={immutableIntentsOverview.get('meta')}
                            loading={isFetchingIntentsOverview}
                            config={statsConfig.get(INTENTS_OVERVIEW)}
                        />
                    </KeyMetricStatWrapper>
                    <StatWrapper
                        stat={intentsBreakdownPerDay}
                        isFetchingStat={isFetchingIntentsBreakdownPerDay}
                        resourceName={INTENTS_BREAKDOWN_PER_DAY}
                        statsFilters={pageStatsFilters}
                        helpText="Intents detected per day"
                        isDownloadable
                    >
                        {(stat) => (
                            <BarStat
                                data={stat.getIn(['data', 'data'])}
                                legend={stat.getIn(['data', 'legend'])}
                                config={statsConfig.get(
                                    INTENTS_BREAKDOWN_PER_DAY
                                )}
                            />
                        )}
                    </StatWrapper>
                    <StatWrapper
                        stat={intentsOccurrence}
                        isFetchingStat={isFetchingIntentsOccurrence}
                        resourceName={INTENTS_OCCURRENCE}
                        statsFilters={pageStatsFilters}
                        helpText="Intents occurrence on tickets"
                        isDownloadable
                    >
                        {(stat) => (
                            <TableStat
                                context={{tagColors: null}}
                                data={stat.getIn(['data', 'data'])}
                                meta={stat.get('meta')}
                                config={statsConfig.get(INTENTS_OCCURRENCE)}
                            />
                        )}
                    </StatWrapper>
                </>
            )}
        </StatsPage>
    )
}
