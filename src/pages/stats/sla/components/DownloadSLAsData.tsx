import React, {useMemo} from 'react'
import {useSatisfiedOrBreachedTicketsTimeSeries} from 'hooks/reporting/sla/useSatisfiedOrBreachedTicketsTimeSeries'
import {logEvent, SegmentEvent} from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import {DownloadSLAsDataButton} from 'pages/stats/sla/components/DownloadSLAsDataButton'
import {useTicketSlaAchievementRateTrend} from 'hooks/reporting/sla/useTicketSlaAchievementRate'
import {
    useBreachedSlaTicketsTrend,
    useSatisfiedSlaTicketsTrend,
} from 'hooks/reporting/sla/useSLAsTicketsTrends'
import {saveReport} from 'services/reporting/SLAsReportingService'
import {
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    getCleanStatsFiltersWithTimezone,
} from 'state/ui/stats/selectors'

export const DownloadSLAsData = ({hidden = false}: {hidden?: boolean}) => {
    const {cleanStatsFilters: legacyStatsFilters} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const {
        cleanStatsFilters: statsFiltersWithLogicalOperators,
        userTimezone,
        granularity,
    } = useAppSelector(getCleanStatsFiltersWithLogicalOperatorsWithTimezone)

    const cleanStatsFilters = hidden
        ? statsFiltersWithLogicalOperators
        : legacyStatsFilters

    const slaAchievementRateTrend = useTicketSlaAchievementRateTrend()
    const slaBreachedTickets = useBreachedSlaTicketsTrend()
    const slaSatisfiedTickets = useSatisfiedSlaTicketsTrend()

    const achievedOrBreachedSLAsTicketsTimeSeries =
        useSatisfiedOrBreachedTicketsTimeSeries(
            cleanStatsFilters,
            userTimezone,
            granularity
        )

    const exportableData = useMemo(() => {
        return {
            slaAchievementRateTrend,
            slaBreachedTickets,
            slaSatisfiedTickets,
            achievedOrBreachedSLAsTicketsTimeSeries,
        }
    }, [
        slaAchievementRateTrend,
        slaBreachedTickets,
        slaSatisfiedTickets,
        achievedOrBreachedSLAsTicketsTimeSeries,
    ])

    const loading = useMemo(() => {
        return Object.values(exportableData).some((metric) => {
            return metric.isFetching
        })
    }, [exportableData])

    return (
        <DownloadSLAsDataButton
            onClick={async () => {
                logEvent(SegmentEvent.StatDownloadClicked, {
                    name: 'all-metrics',
                })
                await saveReport(
                    exportableData,
                    cleanStatsFilters.period,
                    granularity
                )
            }}
            disabled={loading}
        />
    )
}
