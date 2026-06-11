import { useMemo } from 'react'

import { SELF_SERVICE_PRODUCTS_WITH_MOST_ISSUES_AND_RETURN_REQUESTS } from 'domains/reporting/config/stats'
import { useStatResource } from 'domains/reporting/hooks/useStatResource'
import type {
    TextStatAxisValue,
    TwoDimensionalChart,
} from 'domains/reporting/models/stat/types'
import { AUTOMATION_SELF_SERVICE_STAT_NAME } from 'domains/reporting/pages/self-service/constants'
import { limitStatFiltersPeriod } from 'pages/aiAgent/analyticsOverview/utils/limitStatFiltersPeriod'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

const MAX_DAYS = 90

type ProductCellValue = { image_url: string; name: string }
type IssuesCellValue = Record<string, number>

type ReturnOrdersStatLine = [
    product?: { type: 'product'; value: ProductCellValue },
    totalIssuesReported?: { type: 'number'; value: number },
    issuesReported?: { type: 'issues'; value: IssuesCellValue },
    returnRequests?: { type: 'number'; value: number },
]

export type ReturnOrdersRow = {
    Product: ProductCellValue
    'Issues reported': number
    'Issues description': IssuesCellValue
    'Return requests': number
}

export type ReturnOrdersDrillDownData = {
    rows: ReturnOrdersRow[]
    count: number
    isLoading: boolean
    isPeriodLimited: boolean
}

function mapLineToRow(line: ReturnOrdersStatLine): ReturnOrdersRow {
    const [product, totalIssuesReported, issuesReported, returnRequests] = line
    return {
        Product: product?.value ?? { image_url: '', name: '' },
        'Issues reported': totalIssuesReported?.value ?? 0,
        'Issues description': issuesReported?.value ?? {},
        'Return requests': returnRequests?.value ?? 0,
    }
}

export const useReturnOrdersDrillDownData = (): ReturnOrdersDrillDownData => {
    const { statsFilters } = useAiAgentStatsFilters()

    // this API is limited to max 90 days of data, so only show the most recent 90 days
    const { limitedStatsFilters, isPeriodLimited } = useMemo(() => {
        const limitedPeriod = limitStatFiltersPeriod(
            statsFilters.period,
            MAX_DAYS,
        )
        return {
            limitedStatsFilters: {
                period: limitedPeriod,
                integrations: statsFilters.stores?.values,
                channels: statsFilters.channels?.values,
            },
            isPeriodLimited:
                limitedPeriod.start_datetime !==
                statsFilters.period.start_datetime,
        }
    }, [statsFilters])

    const [stat, isLoading] = useStatResource<
        TwoDimensionalChart<TextStatAxisValue, ReturnOrdersStatLine>
    >({
        statName: AUTOMATION_SELF_SERVICE_STAT_NAME,
        resourceName:
            SELF_SERVICE_PRODUCTS_WITH_MOST_ISSUES_AND_RETURN_REQUESTS,
        statsFilters: limitedStatsFilters,
    })

    const rows = useMemo((): ReturnOrdersRow[] => {
        const lines: ReturnOrdersStatLine[] = stat?.data.data.lines ?? []

        return lines.map((line) => mapLineToRow(line))
    }, [stat])

    return { rows, count: rows.length, isLoading, isPeriodLimited }
}
