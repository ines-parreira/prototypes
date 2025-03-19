import { logEvent, SegmentEvent } from 'common/segment'
import { useDownloadSLAsData } from 'hooks/reporting/sla/useDownloadSLAsData'
import { DownloadSLAsDataButton } from 'pages/stats/sla/components/DownloadSLAsDataButton'
import { saveZippedFiles } from 'utils/file'

export const DownloadSLAsData = () => {
    const { files, fileName, isLoading } = useDownloadSLAsData()

    return (
        <DownloadSLAsDataButton
            onClick={async () => {
                logEvent(SegmentEvent.StatDownloadClicked, {
                    name: 'all-metrics',
                })
                await saveZippedFiles(files, fileName)
            }}
            disabled={isLoading}
        />
    )
}
