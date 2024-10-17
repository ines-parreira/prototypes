import moment from 'moment/moment'
import {Period} from 'models/stat/types'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'
import {MaybeData, OneDimensionalDataItem} from 'pages/stats/types'
import {
    CURRENT_PERIOD_LABEL,
    CUSTOMER_SATISFACTION_LABEL,
    DATE_TIME_FORMAT,
    EMPTY_LABEL,
    MEDIAN_FIRST_RESPONSE_TIME_LABEL,
    MESSAGES_PER_TICKET_LABEL,
    MESSAGES_SENT_LABEL,
    NOT_AVAILABLE_LABEL,
    OPEN_TICKETS_LABEL,
    PREVIOUS_PERIOD_LABEL,
    MEDIAN_RESOLUTION_TIME_LABEL,
    TICKETS_CLOSED_LABEL,
    TICKETS_CREATED_LABEL,
    TICKETS_REPLIED_LABEL,
    WORKLOAD_BY_CHANNEL_LABEL,
} from 'services/reporting/constants'
import {createCsv, saveZippedFiles} from 'utils/file'

export interface SupportPerformanceReportData {
    customerSatisfactionTrend: MetricTrend
    medianFirstResponseTimeTrend: MetricTrend
    medianResolutionTimeTrend: MetricTrend
    messagesPerTicketTrend: MetricTrend
    openTicketsTrend: MetricTrend
    closedTicketsTrend: MetricTrend
    ticketsCreatedTrend: MetricTrend
    ticketsRepliedTrend: MetricTrend
    messagesSentTrend: MetricTrend
    ticketsCreatedTimeSeries: MaybeData<TimeSeriesDataItem[][]>
    ticketsClosedTimeSeries: MaybeData<TimeSeriesDataItem[][]>
    ticketsRepliedTimeSeries: MaybeData<TimeSeriesDataItem[][]>
    messagesSentTimeSeries: MaybeData<TimeSeriesDataItem[][]>
    workloadPerChannel: MaybeData<OneDimensionalDataItem[]>
    workloadPerChannelPrevious: MaybeData<OneDimensionalDataItem[]>
}

export const saveReport = async (
    data: SupportPerformanceReportData,
    period: Period
) => {
    const {
        customerSatisfactionTrend,
        medianFirstResponseTimeTrend,
        medianResolutionTimeTrend,
        messagesPerTicketTrend,
        openTicketsTrend,
        closedTicketsTrend,
        ticketsCreatedTrend,
        ticketsRepliedTrend,
        messagesSentTrend,
        ticketsCreatedTimeSeries,
        ticketsClosedTimeSeries,
        ticketsRepliedTimeSeries,
        messagesSentTimeSeries,
        workloadPerChannel,
        workloadPerChannelPrevious,
    } = data

    const customerExperienceData = () => [
        [EMPTY_LABEL, CURRENT_PERIOD_LABEL, PREVIOUS_PERIOD_LABEL],
        [
            CUSTOMER_SATISFACTION_LABEL,
            customerSatisfactionTrend.data?.value,
            customerSatisfactionTrend.data?.prevValue,
        ],
        [
            MEDIAN_FIRST_RESPONSE_TIME_LABEL,
            medianFirstResponseTimeTrend.data?.value,
            medianFirstResponseTimeTrend.data?.prevValue,
        ],
        [
            MEDIAN_RESOLUTION_TIME_LABEL,
            medianResolutionTimeTrend.data?.value,
            medianResolutionTimeTrend.data?.prevValue,
        ],
        [
            MESSAGES_PER_TICKET_LABEL,
            messagesPerTicketTrend.data?.value,
            messagesPerTicketTrend.data?.prevValue,
        ],
    ]

    const workloadData = () => [
        [EMPTY_LABEL, CURRENT_PERIOD_LABEL, PREVIOUS_PERIOD_LABEL],
        [
            OPEN_TICKETS_LABEL,
            openTicketsTrend.data?.value,
            openTicketsTrend.data?.prevValue,
        ],
        [
            TICKETS_CREATED_LABEL,
            ticketsCreatedTrend.data?.value,
            ticketsCreatedTrend.data?.prevValue,
        ],
        [
            TICKETS_REPLIED_LABEL,
            ticketsRepliedTrend.data?.value,
            ticketsRepliedTrend.data?.prevValue,
        ],
        [
            TICKETS_CLOSED_LABEL,
            closedTicketsTrend.data?.value,
            closedTicketsTrend.data?.prevValue,
        ],
        [
            MESSAGES_SENT_LABEL,
            messagesSentTrend.data?.value,
            messagesSentTrend.data?.prevValue,
        ],
        ...(workloadPerChannel.data?.map((channelData) => [
            `${WORKLOAD_BY_CHANNEL_LABEL} - ${channelData.label}`,
            channelData.value,
            workloadPerChannelPrevious.data?.find(
                (row) => row.label === channelData.label
            )?.value || NOT_AVAILABLE_LABEL,
        ]) || []),
    ]

    const ticketVolumeData = [
        [
            EMPTY_LABEL,
            TICKETS_CREATED_LABEL,
            TICKETS_CLOSED_LABEL,
            TICKETS_REPLIED_LABEL,
            MESSAGES_SENT_LABEL,
        ],
        ...(ticketsCreatedTimeSeries.data?.[0].map((date) => [
            date.dateTime,
            ticketsCreatedTimeSeries.data?.[0].find(
                ({dateTime}) => date.dateTime === dateTime
            )?.value || NOT_AVAILABLE_LABEL,
            ticketsClosedTimeSeries.data?.[0].find(
                ({dateTime}) => date.dateTime === dateTime
            )?.value || NOT_AVAILABLE_LABEL,
            ticketsRepliedTimeSeries.data?.[0].find(
                ({dateTime}) => date.dateTime === dateTime
            )?.value || NOT_AVAILABLE_LABEL,
            messagesSentTimeSeries.data?.[0].find(
                ({dateTime}) => date.dateTime === dateTime
            )?.value || NOT_AVAILABLE_LABEL,
        ]) || []),
    ]
    const export_datetime = moment().format(DATE_TIME_FORMAT)
    const startDate = moment(period.start_datetime).format(DATE_TIME_FORMAT)
    const endDate = moment(period.end_datetime).format(DATE_TIME_FORMAT)
    const periodPrefix = `${startDate}_${endDate}`

    return saveZippedFiles(
        {
            [`${periodPrefix}-customer-experience-${export_datetime}.csv`]:
                createCsv(customerExperienceData()),
            [`${periodPrefix}-workload-${export_datetime}.csv`]:
                createCsv(workloadData()),
            [`${periodPrefix}-ticket-volume-${export_datetime}.csv`]:
                createCsv(ticketVolumeData),
        },
        `${periodPrefix}-overview-metrics-${export_datetime}`
    )
}
