import moment from 'moment/moment'
import {Period} from 'models/stat/types'

import {
    CURRENT_PERIOD_LABEL,
    DATE_TIME_FORMAT,
    EMPTY_LABEL,
    NOT_AVAILABLE_LABEL,
    PREVIOUS_PERIOD_LABEL,
} from 'services/reporting/constants'
import {createCsv, saveZippedFiles} from 'utils/file'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {
    AVERAGE_TALK_TIME_METRIC_TITLE,
    AVERAGE_WAIT_TIME_METRIC_TITLE,
    INBOUND_CALLS_METRIC_TITLE,
    MISSED_CALLS_METRIC_TITLE,
    OUTBOUND_CALLS_METRIC_TITLE,
    TOTAL_CALLS_METRIC_TITLE,
} from 'pages/stats/voice/constants/voiceOverview'
import {formatMetricValue} from 'pages/stats/common/utils'

export interface VoiceReportData {
    averageWaitTimeTrend: MetricTrend
    averageTalkTimeTrend: MetricTrend
    totalCallsCountTrend: MetricTrend
    outboundCallsCountTrend: MetricTrend
    inboundCallsCountTrend: MetricTrend
    missedCallsCountTrend: MetricTrend
}

export const saveReport = async (data: VoiceReportData, period: Period) => {
    const {
        averageWaitTimeTrend,
        averageTalkTimeTrend,
        totalCallsCountTrend,
        outboundCallsCountTrend,
        inboundCallsCountTrend,
        missedCallsCountTrend,
    } = data

    const formatValue = (value?: number | null) =>
        value ? formatMetricValue(value) : NOT_AVAILABLE_LABEL

    const callerExperienceData = [
        [EMPTY_LABEL, CURRENT_PERIOD_LABEL, PREVIOUS_PERIOD_LABEL],
        [
            AVERAGE_WAIT_TIME_METRIC_TITLE,
            formatValue(averageWaitTimeTrend.data?.value),
            formatValue(averageWaitTimeTrend.data?.prevValue),
        ],
        [
            AVERAGE_TALK_TIME_METRIC_TITLE,
            formatValue(averageTalkTimeTrend.data?.value),
            formatValue(averageTalkTimeTrend.data?.prevValue),
        ],
    ]
    const callVolumeData = [
        [EMPTY_LABEL, CURRENT_PERIOD_LABEL, PREVIOUS_PERIOD_LABEL],
        [
            TOTAL_CALLS_METRIC_TITLE,
            totalCallsCountTrend.data?.value,
            totalCallsCountTrend.data?.prevValue,
        ],
        [
            OUTBOUND_CALLS_METRIC_TITLE,
            outboundCallsCountTrend.data?.value,
            outboundCallsCountTrend.data?.prevValue,
        ],
        [
            INBOUND_CALLS_METRIC_TITLE,
            inboundCallsCountTrend.data?.value,
            inboundCallsCountTrend.data?.prevValue,
        ],
        [
            MISSED_CALLS_METRIC_TITLE,
            missedCallsCountTrend.data?.value,
            missedCallsCountTrend.data?.prevValue,
        ],
    ]

    const export_datetime = moment().format(DATE_TIME_FORMAT)
    const startDate = moment(period.start_datetime).format(DATE_TIME_FORMAT)
    const endDate = moment(period.end_datetime).format(DATE_TIME_FORMAT)
    const periodPrefix = `${startDate}_${endDate}`

    return saveZippedFiles(
        {
            [`${periodPrefix}-caller-experience-${export_datetime}.csv`]:
                createCsv(callerExperienceData),
            [`${periodPrefix}-call-volume-${export_datetime}.csv`]:
                createCsv(callVolumeData),
        },
        `${periodPrefix}-voice-call-overview-metrics-${export_datetime}`
    )
}
