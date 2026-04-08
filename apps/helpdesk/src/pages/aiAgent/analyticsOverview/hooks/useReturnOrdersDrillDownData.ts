import { useMemo } from 'react'

import { SELF_SERVICE_PRODUCTS_WITH_MOST_ISSUES_AND_RETURN_REQUESTS } from 'domains/reporting/config/stats'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import useStatResource from 'domains/reporting/hooks/useStatResource'
import type {
    TextStatAxisValue,
    TwoDimensionalChart,
} from 'domains/reporting/models/stat/types'
import { AUTOMATION_SELF_SERVICE_STAT_NAME } from 'domains/reporting/pages/self-service/constants'
import { limitStatFiltersPeriod } from 'pages/aiAgent/analyticsOverview/utils/limitStatFiltersPeriod'

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
    'Total issues reported': number
    'Issues reported': IssuesCellValue
    'Return Requests': number
}

export type ReturnOrdersDrillDownData = {
    rows: ReturnOrdersRow[]
    count: number
    isLoading: boolean
}

function mapLineToRow(line: ReturnOrdersStatLine): ReturnOrdersRow {
    const [product, totalIssuesReported, issuesReported, returnRequests] = line
    return {
        Product: product?.value ?? { image_url: '', name: '' },
        'Total issues reported': totalIssuesReported?.value ?? 0,
        'Issues reported': issuesReported?.value ?? {},
        'Return Requests': returnRequests?.value ?? 0,
    }
}

export const useReturnOrdersDrillDownData = (): ReturnOrdersDrillDownData => {
    const { statsFilters } = useAutomateFilters()

    // this API is limited to max 90 days of data, so only show the most recent 90 days
    const limitedStatsFilters = useMemo(
        () => ({
            period: limitStatFiltersPeriod(statsFilters.period, MAX_DAYS),
        }),
        [statsFilters],
    )

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

    return { rows, count: rows.length, isLoading }
}
