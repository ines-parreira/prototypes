import {useMemo} from 'react'
import {ChannelsTableColumns} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {
    useMetricPerDimension,
    useMetricPerDimensionWithEnrichment,
} from 'hooks/reporting/useMetricPerDimension'
import {IDRecord, MergedRecord} from 'hooks/reporting/withEnrichment'
import useAppSelector from 'hooks/useAppSelector'
import {OrderDirection} from 'models/api/types'
import {Cubes} from 'models/reporting/cubes'
import {HandleTimeCubeWithJoins} from 'models/reporting/cubes/agentxp/HandleTimeCube'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    TicketSLACubeWithJoins,
    TicketSLADimension,
} from 'models/reporting/cubes/sla/TicketSLACube'
import {EnrichmentFields, ReportingQuery} from 'models/reporting/types'
import {getDrillDownQuery} from 'pages/stats/DrillDownTableConfig'
import {getHumanAndAutomationBotAgentsJS} from 'state/agents/selectors'
import {
    DrillDownMetric,
    getDrillDownCurrentPage,
    setCurrentPage,
} from 'state/ui/stats/drillDownSlice'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {
    OverviewMetric,
    SlaMetric,
    AgentsTableColumn,
} from 'state/ui/stats/types'
import {ConvertOrderConversionCube} from 'models/reporting/cubes/ConvertOrderConversionCube'
import {
    BaseDrillDownRowData,
    getEnrichedDrillDownFormatter,
    TicketDrillDownRowData,
} from 'pages/stats/DrillDownFormatters'
import useAppDispatch from 'hooks/useAppDispatch'
import {VoiceCallCube} from 'models/reporting/cubes/VoiceCallCube'

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
]

export const getDrillDownMetricOrder = (
    metricName: DrillDownMetric['metricName']
) => {
    return metricName === OverviewMetric.CustomerSatisfaction ||
        metricName === AgentsTableColumn.CustomerSatisfaction ||
        metricName === ChannelsTableColumns.CustomerSatisfaction
        ? OrderDirection.Asc
        : OrderDirection.Desc
}

export const useDrillDownQuery = (metricData: DrillDownMetric) => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    return getDrillDownQuery(metricData)(
        cleanStatsFilters,
        userTimezone,
        getDrillDownMetricOrder(metricData.metricName)
    )
}

function withoutLimit<Cube extends Cubes>(
    query: ReportingQuery<Cube>
): ReportingQuery<Cube> {
    return {
        ...query,
        limit: undefined,
    }
}

export const useDrillDownQueryWithoutLimit = (
    metricData: DrillDownMetric
): ReportingQuery<
    | HelpdeskMessageCubeWithJoins
    | HandleTimeCubeWithJoins
    | TicketSLACubeWithJoins
    | ConvertOrderConversionCube
    | VoiceCallCube
> => {
    const query = useDrillDownQuery(metricData)

    return withoutLimit(query)
}

export const useEnrichedDrillDownData = (
    metricData: DrillDownMetric
): DrillDownData<TicketDrillDownRowData> => {
    const dispatch = useAppDispatch()
    const currentPage = useAppSelector(getDrillDownCurrentPage)
    const formatter = getEnrichedDrillDownFormatter(metricData)
    const query = useDrillDownQuery(metricData)
    const agents = useAppSelector(getHumanAndAutomationBotAgentsJS)
    const {data: someData, isFetching} = useMetricPerDimensionWithEnrichment(
        query,
        defaultEnrichmentFields
    )

    const rowData = useMemo(
        () => aggregateSlas(someData?.allData, metricData, query.dimensions[0]),
        [metricData, query.dimensions, someData?.allData]
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
                        Math.ceil(totalResults / DRILL_DOWN_PER_PAGE)
                    )
                )
            ),
        data: rowData
            .map((row) =>
                formatter(
                    row,
                    agents,
                    query.dimensions[1] ?? query.measures[0],
                    query.dimensions[0]
                )
            )
            .slice(
                Math.max((currentPage - 1) * DRILL_DOWN_PER_PAGE, 0),
                Math.min(currentPage * DRILL_DOWN_PER_PAGE, totalResults)
            ),
    }
}

export type DrillDownDataHook<T extends BaseDrillDownRowData> = (
    metricData: DrillDownMetric
) => DrillDownData<T>

export type DrillDownDataHookWithFormatter = <T>(
    metricData: DrillDownMetric,
    getDrillDownFormatter: (
        row: MergedRecord<any, any>,
        metricField: string
    ) => T
) => DrillDownData<T>

export function useDrillDownData<T>(
    metricData: DrillDownMetric,
    getDrillDownFormatter: (
        row: MergedRecord<any, any>,
        metricField: string
    ) => T
): DrillDownData<T> {
    const dispatch = useAppDispatch()
    const currentPage = useAppSelector(getDrillDownCurrentPage)
    const query = useDrillDownQuery(metricData)
    const {data: someData, isFetching} = useMetricPerDimension(query)

    const rowData = useMemo(() => someData?.allData || [], [someData])
    const totalResults = rowData.length

    const formattedRowData = rowData.map((row) =>
        getDrillDownFormatter(row, query.dimensions[1] ?? query.measures[0])
    )
    const slicedRowData = formattedRowData.slice(
        Math.max((currentPage - 1) * DRILL_DOWN_PER_PAGE, 0),
        Math.min(currentPage * DRILL_DOWN_PER_PAGE, totalResults)
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
                        Math.ceil(totalResults / DRILL_DOWN_PER_PAGE)
                    )
                )
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
    ticketIdField: string
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
            }, {})
        )
    }

    return allData
}
