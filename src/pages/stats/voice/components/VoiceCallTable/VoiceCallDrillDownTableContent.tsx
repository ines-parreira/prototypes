import { useDrillDownData } from 'hooks/reporting/useDrillDownData'
import { formatVoiceDrillDownRowData } from 'pages/stats/DrillDownFormatters'
import { DrillDownMetric } from 'state/ui/stats/drillDownSlice'

import { getVoiceDrillDownColumns } from './utils'
import VoiceCallTableContent from './VoiceCallTableContent'

type Props = {
    metricData: DrillDownMetric
}

export default function VoiceCallDrillDownTableContent({ metricData }: Props) {
    const { data, isFetching } = useDrillDownData(
        metricData,
        formatVoiceDrillDownRowData,
    )

    return (
        <VoiceCallTableContent
            data={data}
            isFetching={isFetching}
            onRowClick={(voiceCall) => {
                window.open(`/app/ticket/${voiceCall.ticketId}`, '_blank')
            }}
            isRecordingDownloadable={false}
            columns={getVoiceDrillDownColumns(metricData.metricName)}
            useMeasuredWidth={false}
        />
    )
}
