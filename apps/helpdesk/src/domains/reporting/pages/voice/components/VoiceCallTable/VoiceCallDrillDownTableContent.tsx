import { getVoiceDrillDownColumns } from 'domains/reporting/pages/voice/components/VoiceCallTable/utils'
import VoiceCallTableContent from 'domains/reporting/pages/voice/components/VoiceCallTable/VoiceCallTableContent'
import { useVoiceDrillDownHookV2 } from 'domains/reporting/pages/voice/VoiceConfigs/useVoiceDrillDownHookV2'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'

type Props = {
    metricData: DrillDownMetric
}

export default function VoiceCallDrillDownTableContent({ metricData }: Props) {
    const { data, isFetching } = useVoiceDrillDownHookV2(metricData)

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
