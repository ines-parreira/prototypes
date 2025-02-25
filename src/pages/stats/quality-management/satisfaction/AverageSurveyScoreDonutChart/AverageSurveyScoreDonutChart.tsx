import React, { useMemo } from 'react'

import analyticsColorsModern from 'assets/css/new/stats/modern.json'
import { useSurveyScores } from 'hooks/reporting/quality-management/satisfaction/useSurveyScores'
import { useNewStatsFilters } from 'hooks/reporting/support-performance/useNewStatsFilters'
import { MetricWithDecile } from 'hooks/reporting/useMetricPerDimension'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import ChartCard from 'pages/stats/ChartCard'
import DonutChart from 'pages/stats/common/components/charts/DonutChart/DonutChart'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'
import { NoDataAvailable } from 'pages/stats/NoDataAvailable'
import { AverageScoreTrend } from 'pages/stats/quality-management/satisfaction/AverageSurveyScoreDonutChart/AverageScoreTrend'
import css from 'pages/stats/quality-management/satisfaction/AverageSurveyScoreDonutChart/AverageSurveyScoreDonutChart.less'
import { SatisfactionMetricConfig } from 'pages/stats/quality-management/satisfaction/SatisfactionMetricsConfig'
import { OneDimensionalDataItem } from 'pages/stats/types'
import { SatisfactionMetric } from 'state/ui/stats/types'

type ChartData = {
    data: OneDimensionalDataItem[]
    customColors: string[]
}

const EMPTY_CHART_DATA = [
    {
        label: '1',
        value: 0,
        backgroundColor: analyticsColorsModern.analytics.data.pink.value,
    },
    {
        label: '2',
        value: 0,
        backgroundColor: analyticsColorsModern.analytics.data.yellow.value,
    },
    {
        label: '3',
        value: 0,
        backgroundColor: analyticsColorsModern.analytics.data.brown.value,
    },
    {
        label: '4',
        value: 0,
        backgroundColor: analyticsColorsModern.analytics.data.blue.value,
    },
    {
        label: '5',
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

    return EMPTY_CHART_DATA.map((item) => {
        return {
            ...item,
            value: parseInt(dataMap[item.label] ?? '0'),
            label: `${item.label} ${labelSuffix}`,
        }
    })
}

export default function AverageSurveyScoreDonutChart(
    props: DashboardChartProps,
) {
    const { cleanStatsFilters, userTimezone } = useNewStatsFilters()

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
