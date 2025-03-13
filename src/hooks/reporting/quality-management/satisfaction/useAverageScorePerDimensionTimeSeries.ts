import { User } from 'config/types/user'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import {
    fetchTimeSeriesPerDimension,
    useTimeSeriesPerDimension,
} from 'hooks/reporting/useTimeSeries'
import { OrderDirection } from 'models/api/types'
import { Integration } from 'models/integration/types'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import { TicketMessagesDimension } from 'models/reporting/cubes/TicketMessagesCube'
import { averageCSATScorePerDimensionTimeSeriesFactory } from 'models/reporting/queryFactories/satisfaction/averageCSATScorePerDimensionQueryFactory'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { ReportFetch } from 'pages/stats/dashboards/types'
import {
    getFormattedInfo,
    transformToTimeSeriesData,
} from 'pages/stats/quality-management/satisfaction/AverageScorePerDimensionTrendChart/utils'
import { createTimeSeriesPerDimensionReport } from 'services/reporting/SLAsReportingService'
import { SatisfactionMetric } from 'state/ui/stats/types'

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

export const useAverageCSATScorePerDimensionTimeSeries = (
    dimension: string,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    sorting?: OrderDirection,
) => {
    return useTimeSeriesPerDimension(
        averageCSATScorePerDimensionTimeSeriesFactory(
            dimension,
            filters,
            timezone,
            granularity,
            sorting,
        ),
    )
}

export const useAverageCSATPerDimensionTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    dimension: TicketDimension | TicketMessagesDimension,
) => {
    const { granularity } = useStatsFilters()

    return useAverageCSATScorePerDimensionTimeSeries(
        dimension,
        filters,
        timezone,
        granularity,
        OrderDirection.Desc,
    )
}
