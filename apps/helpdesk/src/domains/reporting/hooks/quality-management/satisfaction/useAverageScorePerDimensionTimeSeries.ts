import { User } from 'config/types/user'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    fetchTimeSeriesPerDimension,
    useTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useTimeSeries'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { TicketMessagesDimension } from 'domains/reporting/models/cubes/TicketMessagesCube'
import { averageCSATScorePerDimensionTimeSeriesFactory } from 'domains/reporting/models/queryFactories/satisfaction/averageCSATScorePerDimensionQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { ReportFetch } from 'domains/reporting/pages/dashboards/types'
import {
    getFormattedInfo,
    transformToTimeSeriesData,
} from 'domains/reporting/pages/quality-management/satisfaction/AverageScorePerDimensionTrendChart/utils'
import { createTimeSeriesPerDimensionReport } from 'domains/reporting/services/SLAsReportingService'
import { SatisfactionMetric } from 'domains/reporting/state/ui/stats/types'
import { OrderDirection } from 'models/api/types'
import { Integration } from 'models/integration/types'

export const SATISFACTION_AVERAGE_CSAT_OVER_TIME = '{metric}-over-time'

export const useAverageCSATPerAssigneeTimeseries = (
    filters: StatsFilters,
    timezone: string,
) =>
    useAverageCSATPerDimensionTimeSeries(
        filters,
        timezone,
        TicketDimension.AssigneeUserId,
    )

export const fetchAverageCSATPerAssigneeTable: ReportFetch = async (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    context: {
        getAgentDetails?: (id: number) => User | undefined
        integrations?: Array<Integration>
    },
) => {
    const fileName = SATISFACTION_AVERAGE_CSAT_OVER_TIME.replace(
        '{metric}',
        SatisfactionMetric.AverageCSATPerAssignee,
    )
    const timeseriesData = await fetchTimeSeriesPerDimension(
        averageCSATScorePerDimensionTimeSeriesFactory(
            TicketDimension.AssigneeUserId,
            filters,
            timezone,
            granularity,
            OrderDirection.Desc,
        ),
    )

    const { dataToRender = [], labels = [] } = getFormattedInfo({
        dimension: TicketDimension.AssigneeUserId,
        data: timeseriesData,
        integrations: context.integrations,
        getAgentDetails: context.getAgentDetails,
    })
    const { files } = createTimeSeriesPerDimensionReport(
        [
            {
                data: transformToTimeSeriesData({ dataToRender, labels }),
                label: fileName,
            },
        ],
        filters.period,
    )
    return {
        isLoading: false,
        fileName,
        files,
    }
}

export const useAverageCSATPerChannelTimeseries = (
    filters: StatsFilters,
    timezone: string,
) =>
    useAverageCSATPerDimensionTimeSeries(
        filters,
        timezone,
        TicketDimension.Channel,
    )

export const fetchAverageCSATPerChannelTable: ReportFetch = async (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    context: {
        getAgentDetails: (id: number) => User | undefined
        integrations: Array<Integration>
    },
) => {
    const fileName = SATISFACTION_AVERAGE_CSAT_OVER_TIME.replace(
        '{metric}',
        SatisfactionMetric.AverageCSATPerChannel,
    )
    const timeseriesData = await fetchTimeSeriesPerDimension(
        averageCSATScorePerDimensionTimeSeriesFactory(
            TicketDimension.Channel,
            filters,
            timezone,
            granularity,
            OrderDirection.Desc,
        ),
    )
    const { dataToRender = [], labels = [] } = getFormattedInfo({
        dimension: TicketDimension.Channel,
        data: timeseriesData,
        integrations: context.integrations,
        getAgentDetails: context.getAgentDetails,
    })
    const { files } = createTimeSeriesPerDimensionReport(
        [
            {
                data: transformToTimeSeriesData({ dataToRender, labels }),
                label: fileName,
            },
        ],
        filters.period,
    )
    return {
        isLoading: false,
        fileName,
        files,
    }
}

export const useAverageCSATPerIntegrationTimeseries = (
    filters: StatsFilters,
    timezone: string,
) =>
    useAverageCSATPerDimensionTimeSeries(
        filters,
        timezone,
        TicketMessagesDimension.Integration,
    )

export const fetchAverageCSATPerIntegrationTable: ReportFetch = async (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    context: {
        getAgentDetails: (id: number) => User | undefined
        integrations: Array<Integration>
    },
) => {
    const fileName = SATISFACTION_AVERAGE_CSAT_OVER_TIME.replace(
        '{metric}',
        SatisfactionMetric.AverageCSATPerIntegration,
    )
    const timeseriesData = await fetchTimeSeriesPerDimension(
        averageCSATScorePerDimensionTimeSeriesFactory(
            TicketMessagesDimension.Integration,
            filters,
            timezone,
            granularity,
            OrderDirection.Desc,
        ),
    )
    const { dataToRender = [], labels = [] } = getFormattedInfo({
        dimension: TicketMessagesDimension.Integration,
        data: timeseriesData,
        integrations: context.integrations,
        getAgentDetails: context.getAgentDetails,
    })
    const { files } = createTimeSeriesPerDimensionReport(
        [
            {
                data: transformToTimeSeriesData({ dataToRender, labels }),
                label: fileName,
            },
        ],
        filters.period,
    )
    return {
        isLoading: false,
        fileName,
        files,
    }
}

const useAverageCSATPerDimensionTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    dimension:
        | TicketDimension.AssigneeUserId
        | TicketDimension.Channel
        | TicketMessagesDimension.Integration,
) => {
    const { granularity } = useStatsFilters()

    return useTimeSeriesPerDimension(
        averageCSATScorePerDimensionTimeSeriesFactory(
            dimension,
            filters,
            timezone,
            granularity,
            OrderDirection.Desc,
        ),
    )
}
