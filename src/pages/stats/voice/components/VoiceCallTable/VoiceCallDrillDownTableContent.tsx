import React from 'react'
import {formatVoiceDrillDownRowData} from 'pages/stats/DrillDownFormatters'
import {useDrillDownData} from 'hooks/reporting/useDrillDownData'
import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import VoiceCallTableContent from './VoiceCallTableContent'
import {tableColumns} from './constants'

type Props = {
    metricData: DrillDownMetric
}

export default function VoiceCallDrillDownTableContent({metricData}: Props) {
    const {data, isFetching} = useDrillDownData(
        metricData,
        formatVoiceDrillDownRowData
    )

    return (
        <VoiceCallTableContent
            data={data}
            isFetching={isFetching}
            onRowClick={(voiceCall) => {
                window.open(`/app/ticket/${voiceCall.ticketId}`, '_blank')
            }}
            isRecordingDownloadable={false}
            columns={tableColumns[metricData.metricName]}
            useMeasuredWidth={false}
        />
    )
}
