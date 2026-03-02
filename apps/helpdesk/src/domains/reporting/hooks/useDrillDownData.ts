import { useMemo } from 'react'

import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    useMetricPerDimension,
    useMetricPerDimensionV2,
    useMetricPerDimensionWithEnrichment,
} from 'domains/reporting/hooks/useMetricPerDimension'
import type {
    IDRecord,
    MergedRecord,
} from 'domains/reporting/hooks/withEnrichment'
import { TicketSLADimension } from 'domains/reporting/models/cubes/sla/TicketSLACube'
import type { BuiltQuery, Context } from 'domains/reporting/models/scopes/scope'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { EnrichmentFields } from 'domains/reporting/models/types'
import { AiSalesAgentChart } from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import type {
    BaseDrillDownRowData,
    DrillDownFormatterProps,
} from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import type { DrillDownQueryFactory } from 'domains/reporting/pages/common/drill-down/types'
import { AutoQAAgentsTableColumn } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAAgentsTableConfig'
import { OverviewMetric } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import {
    getDrillDownCurrentPage,
    setCurrentPage,
} from 'domains/reporting/state/ui/stats/drillDownSlice'
import {
    AgentsTableColumn,
    AIInsightsMetric,
    AutoQAMetric,
    ChannelsTableColumns,
    SatisfactionMetric,
    SlaMetric,
} from 'domains/reporting/state/ui/stats/types'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { OrderDirection } from 'models/api/types'
import type { DrillDownReportingQuery } from 'models/job/types'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { getHumanAndAutomationBotAgentsJS } from 'state/agents/selectors'

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
        EnrichmentFields.ProductsTitles,
        EnrichmentFields.ProductsVariants,
    ],
    [AIJourneyMetric.TotalOrders]: [
        ...defaultEnrichmentFields,
        EnrichmentFields.CustomerName,
        EnrichmentFields.CustomerIntegrationDataByExternalId,
    ],
    [AIJourneyMetric.ResponseRate]: [
        ...defaultEnrichmentFields,
        EnrichmentFields.CustomerName,
    ],
    [AIJourneyMetric.OptOutRate]: [
        ...defaultEnrichmentFields,
        EnrichmentFields.CustomerName,
    ],
    [AIJourneyMetric.ClickThroughRate]: [
        ...defaultEnrichmentFields,
        EnrichmentFields.CustomerName,
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

export const useDrillDownQuery = (
    query: DrillDownQueryFactory,
    metricData: DrillDownMetric,
) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    return query(
        cleanStatsFilters,
        userTimezone,
        getDrillDownMetricOrder(metricData.metricName),
    )
}

export const useDrillDownQueryV2 = (queryV2?: (ctx: Context) => BuiltQuery) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    if (!queryV2) {
        return undefined
    }

    return queryV2({
        filters: cleanStatsFilters,
        timezone: userTimezone,
    })
}

function withoutLimit<T extends ReportingQuery>(query: T): T {
    return {
        ...query,
        limit: undefined,
    }
}

export const useDrillDownQueryWithoutLimit = (
    metricData: DrillDownMetric,
    queryFactory: DrillDownQueryFactory,
): DrillDownReportingQuery => {
    const query = useDrillDownQuery(queryFactory, metricData)

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
    queryFactory: DrillDownQueryFactory,
    metricData: DrillDownMetric,
    enrichmentFields: EnrichmentFields[],
    getDrillDownFormatter: (props: DrillDownFormatterProps) => T,
    enrichmentIdField: EnrichmentFields,
): DrillDownData<T> {
    const dispatch = useAppDispatch()
    const currentPage = useAppSelector(getDrillDownCurrentPage)
    const query = useDrillDownQuery(queryFactory, metricData)
    const agents = useAppSelector(getHumanAndAutomationBotAgentsJS)
    const { data: someData, isFetching } = useMetricPerDimensionWithEnrichment(
        query,
        enrichmentFields,
        enrichmentIdField,
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

export function useEnrichedDrillDownDataUnpaginated<T>(
    queryFactory: DrillDownQueryFactory,
    metricData: DrillDownMetric,
    enrichmentFields: EnrichmentFields[],
    getDrillDownFormatter: (props: DrillDownFormatterProps) => T,
    enrichmentIdField: EnrichmentFields,
): Omit<
    DrillDownData<T>,
    'perPage' | 'currentPage' | 'pagesCount' | 'onPageChange'
> {
    const query = useDrillDownQuery(queryFactory, metricData)
    const agents = useAppSelector(getHumanAndAutomationBotAgentsJS)
    const { data: someData, isFetching } = useMetricPerDimensionWithEnrichment(
        query,
        enrichmentFields,
        enrichmentIdField,
    )

    const customFieldsIds = useGetCustomTicketsFieldsDefinitionData()

    let rowData = useMemo(
        () => aggregateSlas(someData?.allData, metricData, query.dimensions[0]),
        [metricData, query.dimensions, someData?.allData],
    )
    rowData = filterCSATDataBasedOnIntent(metricData, rowData) || []
    const totalResults = rowData.length

    const formattedData = useMemo(
        () =>
            rowData.map((row) =>
                getDrillDownFormatter({
                    row,
                    metricField: query.dimensions[1] ?? query.measures[0],
                    agents,
                    ticketIdField: query.dimensions[0],
                    customFieldsIds,
                }),
            ),
        [
            rowData,
            getDrillDownFormatter,
            query.dimensions,
            query.measures,
            agents,
            customFieldsIds,
        ],
    )

    return {
        isFetching,
        totalResults,
        data: formattedData,
    }
}

export function useDrillDownData<T>(
    queryFactory: DrillDownQueryFactory,
    metricData: DrillDownMetric,
    getDrillDownFormatter: (props: DrillDownFormatterProps) => T,
): DrillDownData<T> {
    const dispatch = useAppDispatch()
    const currentPage = useAppSelector(getDrillDownCurrentPage)
    const query = useDrillDownQuery(queryFactory, metricData)
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

export function useDrillDownDataV2<T>(
    queryFactory: DrillDownQueryFactory,
    queryFactoryV2: ((ctx: Context) => BuiltQuery) | undefined,
    metricData: DrillDownMetric,
    getDrillDownFormatter: (props: DrillDownFormatterProps) => T,
): DrillDownData<T> {
    const dispatch = useAppDispatch()
    const currentPage = useAppSelector(getDrillDownCurrentPage)
    const query = useDrillDownQuery(queryFactory, metricData)
    const queryV2 = useDrillDownQueryV2(queryFactoryV2)
    const { data: someData, isFetching } = useMetricPerDimensionV2(
        query,
        queryV2,
    )

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
