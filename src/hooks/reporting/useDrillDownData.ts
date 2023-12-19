import {useState} from 'react'
import {TicketMessageSourceType} from 'business/types/ticket'
import {User} from 'config/types/user'
import {useMetricPerDimensionWithEnrichment} from 'hooks/reporting/useMetricPerDimension'
import {MergedRecord} from 'hooks/reporting/withEnrichment'
import useAppSelector from 'hooks/useAppSelector'
import {OrderDirection} from 'models/api/types'
import {Cubes} from 'models/reporting/cubes'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {EnrichmentFields, ReportingQuery} from 'models/reporting/types'
import {getDrillDownQuery} from 'pages/stats/DrillDownTableConfig'
import {getAgentsJS} from 'state/agents/selectors'
import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {OverviewMetric, TableColumn} from 'state/ui/stats/types'

export interface TicketDetails {
    id: number | string
    subject: string | null
    description: string | null
    channel: TicketMessageSourceType | null
    isRead: boolean
    created: string | null
    contactReason: string | null
}

export interface DrillDownRowData {
    ticket: TicketDetails
    metricValue: number
    assignee:
        | ({
              id: number
          } & Partial<User>)
        | null
}

interface DrillDownData {
    isFetching: boolean
    perPage: number
    pagesCount: number
    currentPage: number
    totalResults: number
    onPageChange: (page: number) => void
    data: DrillDownRowData[]
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

export const formatDrillDownRowData = (
    row: MergedRecord<any, any>,
    agents: User[],
    metricField: string
): DrillDownRowData => ({
    ticket: {
        id: row[TicketDimension.TicketId] || null,
        subject: row[EnrichmentFields.TicketName] || null,
        description: row[EnrichmentFields.Description] || null,
        channel: row[EnrichmentFields.Channel] || null,
        isRead: !(row[EnrichmentFields.IsUnread] ?? true),
        created: row[EnrichmentFields.CreatedDatetime] || null,
        contactReason: row[EnrichmentFields.ContactReason] || null,
    },
    metricValue: row[metricField],
    assignee: row[EnrichmentFields.AssigneeId]
        ? {
              id: row[EnrichmentFields.AssigneeId],
              name:
                  agents.find(
                      (agent) => agent.id === row[EnrichmentFields.AssigneeId]
                  )?.name || '',
          }
        : null,
})

export const getDrillDownMetricOrder = (
    metricName: DrillDownMetric['metricName']
) => {
    return metricName === OverviewMetric.CustomerSatisfaction ||
        metricName === TableColumn.CustomerSatisfaction
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
): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const query = useDrillDownQuery(metricData)

    return withoutLimit(query)
}

export const useDrillDownData = (
    metricData: DrillDownMetric
): DrillDownData => {
    const [currentPage, setCurrentPage] = useState(1)
    const query = useDrillDownQuery(metricData)
    const agents = useAppSelector(getAgentsJS)
    const {data: someData, isFetching} = useMetricPerDimensionWithEnrichment(
        query,
        defaultEnrichmentFields
    )

    const rowData = someData?.allData || []
    const totalResults = rowData.length

    return {
        isFetching,
        perPage: DRILL_DOWN_PER_PAGE,
        currentPage,
        totalResults,
        pagesCount: Math.ceil(totalResults / DRILL_DOWN_PER_PAGE),
        onPageChange: (page: number) =>
            setCurrentPage(
                Math.min(page, Math.ceil(totalResults / DRILL_DOWN_PER_PAGE))
            ),
        data: rowData
            .map((row) =>
                formatDrillDownRowData(row, agents, query.dimensions[1])
            )
            .slice(
                Math.max((currentPage - 1) * DRILL_DOWN_PER_PAGE, 0),
                Math.min(currentPage * DRILL_DOWN_PER_PAGE, totalResults)
            ),
    }
}
