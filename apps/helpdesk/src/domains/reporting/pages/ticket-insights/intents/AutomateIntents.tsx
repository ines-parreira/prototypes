import { useMemo } from 'react'

import { fromJS, Map } from 'immutable'

import {
    INTENTS_BREAKDOWN_PER_DAY,
    INTENTS_OCCURRENCE,
    INTENTS_OVERVIEW,
    stats as statsConfig,
} from 'domains/reporting/config/stats'
import useStatResource from 'domains/reporting/hooks/useStatResource'
import {
    LegacyStatsFilters,
    OneDimensionalChart,
    TwoDimensionalChart,
} from 'domains/reporting/models/stat/types'
import { BarStat } from 'domains/reporting/pages/common/components/charts/BarStat'
import KeyMetricStat from 'domains/reporting/pages/common/components/charts/KeyMetricStat/KeyMetricStat'
import TableStat from 'domains/reporting/pages/common/components/charts/TableStat/TableStat'
import KeyMetricStatWrapper from 'domains/reporting/pages/common/components/KeyMetricStatWrapper'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import StatWrapper from 'domains/reporting/pages/common/layout/StatWrapper'
import { AutomateIntentsFilters } from 'domains/reporting/pages/ticket-insights/intents/AutomateIntentsFilters'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'

const AUTOMATION_INTENTS_STAT_NAME = 'automation-intents'

export default function AutomateIntents() {
    const { cleanStatsFilters: statsFilters } = useAppSelector(
        getCleanStatsFiltersWithTimezone,
    )

    const pageStatsFilters = useMemo<LegacyStatsFilters>(() => {
        const { channels, period } = statsFilters
        return { channels, period }
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
            titleExtra={<AutomateIntentsFilters />}
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
                                    INTENTS_BREAKDOWN_PER_DAY,
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
                                context={{ tagColors: null }}
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
