import { useMemo } from 'react'

import { SELF_SERVICE_TOP_REPORTED_ISSUES } from 'domains/reporting/config/stats'
import useStatResource from 'domains/reporting/hooks/useStatResource'
import type {
    Period,
    TextStatAxisValue,
    TwoDimensionalChart,
} from 'domains/reporting/models/stat/types'
import { AUTOMATION_SELF_SERVICE_STAT_NAME } from 'domains/reporting/pages/self-service/constants'
import { SELECTABLE_REASONS_DROPDOWN_OPTIONS } from 'models/selfServiceConfiguration/constants'
import { limitStatFiltersPeriod } from 'pages/aiAgent/analyticsOverview/utils/limitStatFiltersPeriod'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

const MAX_DAYS = 90

const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
})

type TopReportedIssuesStatLine = [
    issue?: { type: 'issue-reason'; value: string },
    percentOfIssues?: { type: 'percent'; value: number },
    ticketsCreated?: { type: 'number'; value: number },
    delta?: { type: 'delta'; value: number },
]

export type TopReportedIssuesRow = {
    Issue: string
    '% of issues reported': number
    'Tickets created': number
    Delta: number
}

export type TopReportedIssuesDrillDownData = {
    rows: TopReportedIssuesRow[]
    count: number
    isLoading: boolean
    isPeriodLimited: boolean
    previousPeriod: string
}

function formatIssueLabel(reasonKey: string): string {
    return (
        SELECTABLE_REASONS_DROPDOWN_OPTIONS.find(
            (option) => option.value === reasonKey,
        )?.label?.toString() ?? reasonKey
    )
}

function formatPreviousPeriod(period: Period): string {
    const start = new Date(period.start_datetime)
    const end = new Date(period.end_datetime)
    const duration = end.getTime() - start.getTime()

    const previousEnd = new Date(start.getTime() - 1)
    const previousStart = new Date(previousEnd.getTime() - duration)

    return `${dateFormatter.format(previousStart)} - ${dateFormatter.format(previousEnd)}`
}

function mapLineToRow(line: TopReportedIssuesStatLine): TopReportedIssuesRow {
    const [issue, percentOfIssues, ticketsCreated, delta] = line
    return {
        Issue: issue ? formatIssueLabel(issue.value) : '',
        '% of issues reported': percentOfIssues?.value ?? 0,
        'Tickets created': ticketsCreated?.value ?? 0,
        Delta: delta?.value ?? 0,
    }
}

export const useTopReportedIssuesDrillDownData =
    (): TopReportedIssuesDrillDownData => {
        const { statsFilters } = useAiAgentStatsFilters()

        const { limitedStatsFilters, isPeriodLimited, previousPeriod } =
            useMemo(() => {
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
                    previousPeriod: formatPreviousPeriod(limitedPeriod),
                }
            }, [statsFilters])

        const [stat, isLoading] = useStatResource<
            TwoDimensionalChart<TextStatAxisValue, TopReportedIssuesStatLine>
        >({
            statName: AUTOMATION_SELF_SERVICE_STAT_NAME,
            resourceName: SELF_SERVICE_TOP_REPORTED_ISSUES,
            statsFilters: limitedStatsFilters,
        })

        const rows = useMemo((): TopReportedIssuesRow[] => {
            const lines: TopReportedIssuesStatLine[] =
                stat?.data.data.lines ?? []
            return lines.map((line) => mapLineToRow(line))
        }, [stat])

        return {
            rows,
            count: rows.length,
            isLoading,
            isPeriodLimited,
            previousPeriod,
        }
    }
