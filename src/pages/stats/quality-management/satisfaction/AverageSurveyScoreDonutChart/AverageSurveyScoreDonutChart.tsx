import React, { useMemo } from 'react'

import analyticsColorsModern from 'assets/css/new/stats/modern.json'
import { logEvent, SegmentEvent } from 'common/segment'
import { useSurveyScores } from 'hooks/reporting/quality-management/satisfaction/useSurveyScores'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { MetricWithDecile } from 'hooks/reporting/useMetricPerDimension'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import { SatisfactionSurveyScore } from 'models/reporting/queryFactories/satisfaction/averageScoreQueryFactory'
import ChartCard from 'pages/stats/ChartCard'
import DonutChart from 'pages/stats/common/components/charts/DonutChart/DonutChart'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { NoDataAvailable } from 'pages/stats/NoDataAvailable'
import { AverageScoreTrend } from 'pages/stats/quality-management/satisfaction/AverageSurveyScoreDonutChart/AverageScoreTrend'
import css from 'pages/stats/quality-management/satisfaction/AverageSurveyScoreDonutChart/AverageSurveyScoreDonutChart.less'
import { SatisfactionMetricConfig } from 'pages/stats/quality-management/satisfaction/SatisfactionMetricsConfig'
import { OneDimensionalDataItem } from 'pages/stats/types'
import { setMetricData } from 'state/ui/stats/drillDownSlice'
import {
    SatisfactionAverageSurveyScoreMetric,
    SatisfactionMetric,
} from 'state/ui/stats/types'

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
