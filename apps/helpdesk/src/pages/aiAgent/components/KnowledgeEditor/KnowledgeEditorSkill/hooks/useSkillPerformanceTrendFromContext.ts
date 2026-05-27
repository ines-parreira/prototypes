import { useMemo } from 'react'

import moment from 'moment'

import type { ComposedMetricTimeSeriesDataItem } from '@repo/reporting'

import type { ResourceMetricsByDay } from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'

import type { DateRange } from '../../shared/types'

import {
    SKILL_PERFORMANCE_TREND_CSAT_DATA_KEY,
    SKILL_PERFORMANCE_TREND_TICKET_VOLUME_DATA_KEY,
} from './skillPerformanceTrendDataKeys'
import {
    mockSkillPerformanceChartData,
    mockSkillPerformanceChartMarkers,
    USE_MOCK_SKILL_PERFORMANCE_CHART_DATA,
} from './SkillPerformanceTrendMockData'
import { useSkillPerformanceDataContext } from './useSkillPerformanceFromContext'
import type { SkillPerformanceTrendData } from './useSkillPerformanceTrendFromContext.types'

type UseSkillPerformanceTrendFromContextParams = {
    useMockData?: boolean
}

const DATE_FORMAT = 'YYYY-MM-DD'

const enumerateDays = (dateRange: DateRange): string[] => {
    const start = moment(dateRange.start_datetime).startOf('day')
    const end = moment(dateRange.end_datetime).startOf('day')
    if (!start.isValid() || !end.isValid() || end.isBefore(start)) return []

    const days: string[] = []
    const cursor = start.clone()
    while (!cursor.isAfter(end)) {
        days.push(cursor.format(DATE_FORMAT))
        cursor.add(1, 'day')
    }
    return days
}

export const buildSkillPerformanceChartData = (
    metricsByDay: ResourceMetricsByDay[] | null,
    dateRange: DateRange,
): ComposedMetricTimeSeriesDataItem[] => {
    if (!metricsByDay || metricsByDay.length === 0) return []

    const entriesByDate = new Map(
        metricsByDay.map((entry) => [entry.date, entry]),
    )

    return enumerateDays(dateRange).map((date) => {
        const entry = entriesByDate.get(date)
        const ticketVolume = entry?.tickets ?? 0
        const csat = entry?.csat ?? null

        return {
            date,
            [SKILL_PERFORMANCE_TREND_TICKET_VOLUME_DATA_KEY]: ticketVolume,
            [SKILL_PERFORMANCE_TREND_CSAT_DATA_KEY]: csat,
        }
    })
}

export const useSkillPerformanceTrendFromContext = ({
    useMockData = USE_MOCK_SKILL_PERFORMANCE_CHART_DATA,
}: UseSkillPerformanceTrendFromContextParams = {}): SkillPerformanceTrendData => {
    const { skillMetrics } = useSkillPerformanceDataContext()
    const shouldUseMockData = useMockData

    return useMemo(() => {
        if (shouldUseMockData) {
            return {
                chartData: mockSkillPerformanceChartData,
                chartMarkers: mockSkillPerformanceChartMarkers,
                dateRange: skillMetrics.dateRange,
                isLoading: false,
            }
        }

        return {
            chartData: buildSkillPerformanceChartData(
                skillMetrics.metricsByDay,
                skillMetrics.dateRange,
            ),
            dateRange: skillMetrics.dateRange,
            isLoading: skillMetrics.isMetricsByDayLoading,
        }
    }, [shouldUseMockData, skillMetrics])
}
