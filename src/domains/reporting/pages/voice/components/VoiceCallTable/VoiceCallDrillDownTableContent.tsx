import { useDrillDownData } from 'domains/reporting/hooks/useDrillDownData'
import { formatVoiceDrillDownRowData } from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import { getDrillDownQuery } from 'domains/reporting/pages/common/drill-down/helpers'
import { getVoiceDrillDownColumns } from 'domains/reporting/pages/voice/components/VoiceCallTable/utils'
import VoiceCallTableContent from 'domains/reporting/pages/voice/components/VoiceCallTable/VoiceCallTableContent'
import { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'

type Props = {
    metricData: DrillDownMetric
}

export default function VoiceCallDrillDownTableContent({ metricData }: Props) {
    const { data, isFetching } = useDrillDownData(
        getDrillDownQuery(metricData),
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
