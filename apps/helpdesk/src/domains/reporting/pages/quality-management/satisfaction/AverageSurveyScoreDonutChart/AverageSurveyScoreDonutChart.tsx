import React, { useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import analyticsColorsModern from 'assets/css/new/stats/modern.json'
import { useSurveyScores } from 'domains/reporting/hooks/quality-management/satisfaction/useSurveyScores'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { MetricWithDecile } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
} from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { SatisfactionSurveyScore } from 'domains/reporting/models/queryFactories/satisfaction/averageScoreQueryFactory'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import DonutChart from 'domains/reporting/pages/common/components/charts/DonutChart/DonutChart'
import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { AverageScoreTrend } from 'domains/reporting/pages/quality-management/satisfaction/AverageSurveyScoreDonutChart/AverageScoreTrend'
import css from 'domains/reporting/pages/quality-management/satisfaction/AverageSurveyScoreDonutChart/AverageSurveyScoreDonutChart.less'
import { SatisfactionMetricConfig } from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionMetricsConfig'
import { OneDimensionalDataItem } from 'domains/reporting/pages/types'
import { setMetricData } from 'domains/reporting/state/ui/stats/drillDownSlice'
import {
    SatisfactionAverageSurveyScoreMetric,
    SatisfactionMetric,
} from 'domains/reporting/state/ui/stats/types'
import useAppDispatch from 'hooks/useAppDispatch'

type ChartData = {
    data: OneDimensionalDataItem[]
    customColors: string[]
}

const DRILL_DOWN_METRIC_MAP = {
    [SatisfactionSurveyScore.One]:
        SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreOne,
    [SatisfactionSurveyScore.Two]:
        SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreTwo,
    [SatisfactionSurveyScore.Three]:
        SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreThree,
    [SatisfactionSurveyScore.Four]:
        SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreFour,
    [SatisfactionSurveyScore.Five]:
        SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreFive,
} as const

const CHART_DATA_MAP_ARRAY = [
    {
        score: SatisfactionSurveyScore.One,
        value: 0,
        backgroundColor: analyticsColorsModern.analytics.data.pink.value,
    },
    {
        score: SatisfactionSurveyScore.Two,
        value: 0,
        backgroundColor: analyticsColorsModern.analytics.data.yellow.value,
    },
    {
        score: SatisfactionSurveyScore.Three,
        value: 0,
        backgroundColor: analyticsColorsModern.analytics.data.brown.value,
    },
    {
        score: SatisfactionSurveyScore.Four,
        value: 0,
        backgroundColor: analyticsColorsModern.analytics.data.blue.value,
    },
    {
        score: SatisfactionSurveyScore.Five,
        value: 0,
        backgroundColor: analyticsColorsModern.analytics.data.indigo.value,
    },
]

export const formatSurveyScores = (
    scores: MetricWithDecile,
    labelSuffix: string = '★',
) => {
    if (!scores.data?.allData) {
        return []
    }

    const dataMap = scores.data.allData.reduce(
        (acc, item) => ({
            ...acc,
            [`${item[TicketSatisfactionSurveyDimension.SurveyScore]}`]:
                item[TicketSatisfactionSurveyMeasure.ScoredSurveysCount],
        }),
        {},
    )

    return CHART_DATA_MAP_ARRAY.map((item) => {
        return {
            ...item,
            value: parseInt(dataMap[item.score] ?? '0'),
            label: `${item.score} ${labelSuffix}`,
        }
    })
}

export default function AverageSurveyScoreDonutChart(
    props: DashboardChartProps,
) {
    const dispatch = useAppDispatch()
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const scores = useSurveyScores(cleanStatsFilters, userTimezone)

    const data = useMemo(() => {
        const chartData = formatSurveyScores(scores)

        const initialChartData: ChartData = {
            data: [],
            customColors: [],
        }

        return chartData.reduce((acc, { value, backgroundColor, label }) => {
            acc.data.push({ label, value })
            acc.customColors.push(backgroundColor)
            return acc
        }, initialChartData)
    }, [scores])

    const handleSegmentClick = (dataIndex: number) => {
        const { title } =
            SatisfactionMetricConfig[SatisfactionMetric.AverageSurveyScore]
        const score = CHART_DATA_MAP_ARRAY[dataIndex].score
        const drillDownMetric = DRILL_DOWN_METRIC_MAP[score]

        const metricData = { title, metricName: drillDownMetric }

        dispatch(setMetricData(metricData))

        logEvent(SegmentEvent.StatClicked, {
            metric: metricData.metricName,
        })
    }

    return (
        <ChartCard
            {...SatisfactionMetricConfig[SatisfactionMetric.AverageSurveyScore]}
            {...props}
        >
            {!scores.isFetching && scores.data?.allData?.length === 0 ? (
                <NoDataAvailable className={css.noDataAvalable} />
            ) : (
                <DonutChart
                    data={data?.data || []}
                    customColors={data?.customColors || []}
                    displayLegend
                    isLoading={scores.isFetching}
                    legendClassName={css.legend}
                    onSegmentClick={handleSegmentClick}
                >
                    <div className={css.trendWrapper}>
                        <AverageScoreTrend
                            className={css.trend}
                            {...SatisfactionMetricConfig[
                                SatisfactionMetric.AverageSurveyScore
                            ]}
                        />
                    </div>
                </DonutChart>
            )}
        </ChartCard>
    )
}
