import moment from 'moment/moment'
import {ReportingGranularity} from 'models/reporting/types'
import {Period} from 'models/stat/types'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {
    CURRENT_PERIOD_LABEL,
    DATE_TIME_FORMAT,
    EMPTY_LABEL,
    PREVIOUS_PERIOD_LABEL,
    ACHIEVEMENT_RATE_LABEL,
    TICKETS_WITH_BREACHED_SLAS_LABEL,
    BREACHED_SLA_LABEL,
    ACHIEVED_SLA_LABEL,
    DATES_WITHIN_PERIOD_LABEL,
    NOT_AVAILABLE_LABEL,
} from 'services/reporting/constants'
import {createCsv, saveZippedFiles} from 'utils/file'
import {
    getPeriodDateTimes,
    TimeSeriesDataItem,
} from 'hooks/reporting/useTimeSeries'
import {TicketSLAStatus} from 'models/reporting/cubes/sla/TicketSLACube'

export interface SLAsReportData {
    slaAchievementRateTrend: MetricTrend
    slaBreachedTickets: MetricTrend
    slaSatisfiedTickets: MetricTrend
    achievedOrBreachedSLAsTicketsTimeSeries: {
        data: Record<TicketSLAStatus, TimeSeriesDataItem[][]> | undefined
    }
}

export const saveReport = async (
    data: SLAsReportData,
    period: Period,
    granularity: ReportingGranularity
) => {
    const {
        slaAchievementRateTrend,
        slaBreachedTickets,
        slaSatisfiedTickets,
        achievedOrBreachedSLAsTicketsTimeSeries: slaTicketsTimeSeries,
    } = data

    const overview = () => [
        [EMPTY_LABEL, CURRENT_PERIOD_LABEL, PREVIOUS_PERIOD_LABEL],
        [
            ACHIEVEMENT_RATE_LABEL,
            slaAchievementRateTrend.data?.value,
            slaAchievementRateTrend.data?.prevValue,
        ],
        [
            TICKETS_WITH_BREACHED_SLAS_LABEL,
            slaBreachedTickets.data?.value,
            slaBreachedTickets.data?.prevValue,
        ],
    ]

    const ticketsInPolicy = () => [
        [BREACHED_SLA_LABEL, slaBreachedTickets.data?.value],
        [ACHIEVED_SLA_LABEL, slaSatisfiedTickets.data?.value],
    ]

    const dates = getPeriodDateTimes(
        [period.start_datetime, period.end_datetime],
        granularity
    )

    const trend = () => [
        [DATES_WITHIN_PERIOD_LABEL, BREACHED_SLA_LABEL, ACHIEVED_SLA_LABEL],
        ...(dates.map((date) => [
            date,
            slaTicketsTimeSeries.data?.[TicketSLAStatus.Breached]?.[0].find(
                ({dateTime}) => date === dateTime
            )?.value || NOT_AVAILABLE_LABEL,
            slaTicketsTimeSeries.data?.[TicketSLAStatus.Satisfied]?.[0].find(
                ({dateTime}) => date === dateTime
            )?.value || NOT_AVAILABLE_LABEL,
        ]) || []),
    ]

    const export_datetime = moment().format(DATE_TIME_FORMAT)
    const startDate = moment(period.start_datetime).format(DATE_TIME_FORMAT)
    const endDate = moment(period.end_datetime).format(DATE_TIME_FORMAT)
    const periodPrefix = `${startDate}_${endDate}`

    return saveZippedFiles(
        {
            [`${periodPrefix}-overview-${export_datetime}.csv`]:
                createCsv(overview()),
            [`${periodPrefix}-tickets-in-policy-${export_datetime}.csv`]:
                createCsv(ticketsInPolicy()),
            [`${periodPrefix}-trend-${export_datetime}.csv`]:
                createCsv(trend()),
        },
        `${periodPrefix}-sla-report-${export_datetime}`
    )
}
