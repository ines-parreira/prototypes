import { useMemo } from 'react'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import {
    useMetricPerDimension,
    useMetricPerDimensionWithEnrichmentOnTwoDimensions,
} from 'hooks/reporting/useMetricPerDimension'
import { IDRecord, MergedRecord } from 'hooks/reporting/withEnrichment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { OrderDirection } from 'models/api/types'
import { DrillDownReportingQuery } from 'models/job/types'
import { AiSalesAgentConversationsDimension } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentConversations'
import { AiSalesAgentOrdersDimension } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { TicketSLADimension } from 'models/reporting/cubes/sla/TicketSLACube'
import { EnrichmentFields, ReportingQuery } from 'models/reporting/types'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { AiSalesAgentChart } from 'pages/stats/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import {
    BaseDrillDownRowData,
    DrillDownFormatterProps,
} from 'pages/stats/common/drill-down/DrillDownFormatters'
import { getDrillDownQuery } from 'pages/stats/common/drill-down/helpers'
import { AutoQAAgentsTableColumn } from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTableConfig'
import { OverviewMetric } from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import { getHumanAndAutomationBotAgentsJS } from 'state/agents/selectors'
import {
    DrillDownMetric,
    getDrillDownCurrentPage,
    setCurrentPage,
} from 'state/ui/stats/drillDownSlice'
import {
    AgentsTableColumn,
    AIInsightsMetric,
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

export const enrichmentMappingPerMetric: Record<
    string,
    Record<string, EnrichmentFields> | undefined
> = {
    [AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders]: {
        [AiSalesAgentOrdersDimension.TicketId]: EnrichmentFields.TicketId,
        [AiSalesAgentOrdersDimension.CustomerId]:
            EnrichmentFields.OrderCustomerId,
    },
    [AiSalesAgentChart.AiSalesAgentTotalProductRecommendations]: {
        [AiSalesAgentConversationsDimension.TicketId]:
            EnrichmentFields.TicketId,
        [AiSalesAgentConversationsDimension.ProductId]:
            EnrichmentFields.ProductId,
    },
}

export const extraEnrichmentFieldsPerMetric: Record<
    string,
    EnrichmentFields[]
> = {
    [AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders]: [
        ...defaultEnrichmentFields,
        EnrichmentFields.CustomerName,
        EnrichmentFields.CustomerIntegrationDataByExternalId,
    ],
    [AiSalesAgentChart.AiSalesAgentTotalProductRecommendations]: [
        ...defaultEnrichmentFields,
        EnrichmentFields.ProductTitle,
        EnrichmentFields.ProductHandle,
    ],
}

export const getDrillDownMetricOrder = (
    metricName: DrillDownMetric['metricName'],
) => {
    return metricName === OverviewMetric.CustomerSatisfaction ||
        metricName === SatisfactionMetric.AverageSurveyScore ||
        metricName === SatisfactionMetric.SatisfactionScore ||
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
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

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

export const filterCSATDataBasedOnIntent = (
    metricData: DrillDownMetric,
    data:
        | (MergedRecord<any, EnrichmentFields | EnrichmentFields.TicketId> &
              IDRecord<any>)[]
        | null,
) => {
    const isTicketDrillDownMetric =
        metricData.metricName ===
        AIInsightsMetric.TicketDrillDownPerCustomerSatisfaction
    if (
        isTicketDrillDownMetric &&
        metricData?.intentFieldValues &&
        metricData.intentFieldValues.length > 0 &&
        'intentFieldId' in metricData &&
        metricData.intentFieldId &&
        data &&
        data.length > 0
    ) {
        const intentFieldId = metricData.intentFieldId
        return data.filter((row) => {
            const customFields = row[EnrichmentFields.CustomFields] as Record<
                number,
                string | undefined
            >

            const fieldValue = customFields[intentFieldId]

            if (
                typeof fieldValue === 'string' &&
                metricData.intentFieldValues
            ) {
                return metricData.intentFieldValues.some((val) =>
                    fieldValue.startsWith(val),
                )
            }

            return false
        })
    }

    return data
}

export function useEnrichedDrillDownData<T>(
    metricData: DrillDownMetric,
    enrichmentFields: EnrichmentFields[],
    getDrillDownFormatter: (props: DrillDownFormatterProps) => T,
    enrichmentIdField: EnrichmentFields,
    enrichmentMapping?: Record<string, EnrichmentFields>,
): DrillDownData<T> {
    const dispatch = useAppDispatch()
    const currentPage = useAppSelector(getDrillDownCurrentPage)
    const query = useDrillDownQuery(metricData)
    const agents = useAppSelector(getHumanAndAutomationBotAgentsJS)
    const { data: someData, isFetching } =
        useMetricPerDimensionWithEnrichmentOnTwoDimensions(
            query,
            enrichmentFields,
            enrichmentMapping ?? {
                [query.dimensions[0]]: enrichmentIdField,
            },
        )

    const customFieldsIds = useGetCustomTicketsFieldsDefinitionData()

    let rowData = useMemo(
        () => aggregateSlas(someData?.allData, metricData, query.dimensions[0]),
        [metricData, query.dimensions, someData?.allData],
    )
    rowData = filterCSATDataBasedOnIntent(metricData, rowData) || []
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
