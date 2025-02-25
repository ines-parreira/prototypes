import { useMemo } from 'react'

import {
    useMetricPerDimension,
    useMetricPerDimensionWithEnrichment,
} from 'hooks/reporting/useMetricPerDimension'
import { IDRecord, MergedRecord } from 'hooks/reporting/withEnrichment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { OrderDirection } from 'models/api/types'
import { DrillDownReportingQuery } from 'models/job/types'
import { TicketSLADimension } from 'models/reporting/cubes/sla/TicketSLACube'
import { EnrichmentFields, ReportingQuery } from 'models/reporting/types'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import {
    BaseDrillDownRowData,
    DrillDownFormatterProps,
} from 'pages/stats/DrillDownFormatters'
import { getDrillDownQuery } from 'pages/stats/DrillDownTableConfig'
import { AutoQAAgentsTableColumn } from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTableConfig'
import { OverviewMetric } from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import { getHumanAndAutomationBotAgentsJS } from 'state/agents/selectors'
import {
    DrillDownMetric,
    getDrillDownCurrentPage,
    getIsNewFilter,
    setCurrentPage,
} from 'state/ui/stats/drillDownSlice'
import {
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    getCleanStatsFiltersWithTimezone,
} from 'state/ui/stats/selectors'
import {
    AgentsTableColumn,
    AutoQAMetric,
    ChannelsTableColumns,
    SatisfactionMetric,
    SlaMetric,
} from 'state/ui/stats/types'

interface DrillDownData<T> {
    isFetching: boolean
    perPage: number
    pagesCount: number
    currentPage: number
    totalResults: number
    onPageChange: (page: number) => void
    data: T[]
}

export const DRILL_DOWN_PER_PAGE = 20

export const defaultEnrichmentFields: EnrichmentFields[] = [
    EnrichmentFields.TicketName,
    EnrichmentFields.Status,
    EnrichmentFields.Description,
    EnrichmentFields.Channel,
    EnrichmentFields.AssigneeId,
    EnrichmentFields.CreatedDatetime,
    EnrichmentFields.ContactReason,
    EnrichmentFields.IsUnread,
    EnrichmentFields.CustomFields,
]

export const getDrillDownMetricOrder = (
    metricName: DrillDownMetric['metricName'],
) => {
    return metricName === OverviewMetric.CustomerSatisfaction ||
        metricName === SatisfactionMetric.AverageSurveyScore ||
        metricName === AgentsTableColumn.CustomerSatisfaction ||
        metricName === ChannelsTableColumns.CustomerSatisfaction ||
        metricName === AutoQAAgentsTableColumn.ResolutionCompleteness ||
        metricName === AutoQAMetric.ResolutionCompleteness ||
        metricName === AutoQAAgentsTableColumn.CommunicationSkills ||
        metricName === AutoQAMetric.CommunicationSkills ||
        metricName === AutoQAAgentsTableColumn.LanguageProficiency ||
        metricName === AutoQAMetric.LanguageProficiency ||
        metricName === AutoQAAgentsTableColumn.Accuracy ||
        metricName === AutoQAMetric.Accuracy ||
        metricName === AutoQAAgentsTableColumn.Efficiency ||
        metricName === AutoQAMetric.Efficiency ||
        metricName === AutoQAAgentsTableColumn.InternalCompliance ||
        metricName === AutoQAMetric.InternalCompliance ||
        metricName === AutoQAAgentsTableColumn.BrandVoice ||
        metricName === AutoQAMetric.BrandVoice
        ? OrderDirection.Asc
        : OrderDirection.Desc
}

export const useDrillDownQuery = (metricData: DrillDownMetric) => {
    const isAnalyticsNewFilters = useAppSelector(getIsNewFilter)
    const { cleanStatsFilters: legacyStatsFilters } = useAppSelector(
        getCleanStatsFiltersWithTimezone,
    )
    const {
        cleanStatsFilters: statsFiltersWithLogicalOperators,
        userTimezone,
    } = useAppSelector(getCleanStatsFiltersWithLogicalOperatorsWithTimezone)
    const cleanStatsFilters = isAnalyticsNewFilters
        ? statsFiltersWithLogicalOperators
        : legacyStatsFilters

    return getDrillDownQuery(metricData)(
        cleanStatsFilters,
        userTimezone,
        getDrillDownMetricOrder(metricData.metricName),
    )
}

function withoutLimit<T extends ReportingQuery>(query: T): T {
    return {
        ...query,
        limit: undefined,
    }
}

export const useDrillDownQueryWithoutLimit = (
    metricData: DrillDownMetric,
): DrillDownReportingQuery => {
    const query = useDrillDownQuery(metricData)

    return withoutLimit(query)
}

export type DrillDownDataHook<T extends BaseDrillDownRowData> = (
    metricData: DrillDownMetric,
) => DrillDownData<T>

export function useEnrichedDrillDownData<T>(
    metricData: DrillDownMetric,
    enrichmentFields: EnrichmentFields[],
    getDrillDownFormatter: (props: DrillDownFormatterProps) => T,
    enrichmentIdField: EnrichmentFields,
): DrillDownData<T> {
    const dispatch = useAppDispatch()
    const currentPage = useAppSelector(getDrillDownCurrentPage)
    const query = useDrillDownQuery(metricData)
    const agents = useAppSelector(getHumanAndAutomationBotAgentsJS)
    const { data: someData, isFetching } = useMetricPerDimensionWithEnrichment(
        query,
        enrichmentFields,
        enrichmentIdField,
    )

    const customFieldsIds = useGetCustomTicketsFieldsDefinitionData()

    const rowData = useMemo(
        () => aggregateSlas(someData?.allData, metricData, query.dimensions[0]),
        [metricData, query.dimensions, someData?.allData],
    )
    const totalResults = rowData.length

    return {
        isFetching,
        perPage: DRILL_DOWN_PER_PAGE,
        currentPage,
        totalResults,
        pagesCount: Math.ceil(totalResults / DRILL_DOWN_PER_PAGE),
        onPageChange: (page: number) =>
            dispatch(
                setCurrentPage(
                    Math.min(
                        page,
                        Math.ceil(totalResults / DRILL_DOWN_PER_PAGE),
                    ),
                ),
            ),
        data: rowData
            .map((row) =>
                getDrillDownFormatter({
                    row,
                    metricField: query.dimensions[1] ?? query.measures[0],
                    agents,
                    ticketIdField: query.dimensions[0],
                    customFieldsIds,
                }),
            )
            .slice(
                Math.max((currentPage - 1) * DRILL_DOWN_PER_PAGE, 0),
                Math.min(currentPage * DRILL_DOWN_PER_PAGE, totalResults),
            ),
    }
}

export function useDrillDownData<T>(
    metricData: DrillDownMetric,
    getDrillDownFormatter: (props: DrillDownFormatterProps) => T,
): DrillDownData<T> {
    const dispatch = useAppDispatch()
    const currentPage = useAppSelector(getDrillDownCurrentPage)
    const query = useDrillDownQuery(metricData)
    const { data: someData, isFetching } = useMetricPerDimension(query)

    const rowData = useMemo(() => someData?.allData || [], [someData])
    const totalResults = rowData.length

    const formattedRowData = rowData.map((row) =>
        getDrillDownFormatter({
            row,
            metricField: query.dimensions[1] ?? query.measures[0],
        }),
    )
    const slicedRowData = formattedRowData.slice(
        Math.max((currentPage - 1) * DRILL_DOWN_PER_PAGE, 0),
        Math.min(currentPage * DRILL_DOWN_PER_PAGE, totalResults),
    )

    return {
        isFetching,
        perPage: DRILL_DOWN_PER_PAGE,
        currentPage,
        totalResults,
        pagesCount: Math.ceil(totalResults / DRILL_DOWN_PER_PAGE),
        onPageChange: (page: number) =>
            dispatch(
                setCurrentPage(
                    Math.min(
                        page,
                        Math.ceil(totalResults / DRILL_DOWN_PER_PAGE),
                    ),
                ),
            ),
        data: slicedRowData,
    }
}

const aggregateSlas = (
    allData:
        | (MergedRecord<any, EnrichmentFields | EnrichmentFields.TicketId> &
              IDRecord<any>)[]
        | undefined,
    metricData: DrillDownMetric,
    ticketIdField: string,
): MergedRecord<any, any>[] => {
    if (allData === undefined) {
        return []
    }

    if (
        metricData.metricName === SlaMetric.AchievementRate ||
        metricData.metricName === SlaMetric.BreachedTicketsRate
    ) {
        const combinedTicketData = allData.reduce<
            Record<string, MergedRecord<any, any>[]>
        >((acc, current) => {
            const ticketId: string = current[ticketIdField]
            acc[ticketId] = acc[ticketId]
                ? [...acc[ticketId], current]
                : [current]
            return acc
        }, {})

        return Object.keys(combinedTicketData).map((key) =>
            combinedTicketData[key].reduce((acc, current) => {
                const slaPolicyMetricName =
                    current[TicketSLADimension.SlaPolicyMetricName]
                return {
                    ...acc,
                    ...current,
                    slas: {
                        ...acc.slas,
                        [slaPolicyMetricName]: {
                            ...current,
                        },
                    },
                }
            }, {}),
        )
    }

    return allData
}
