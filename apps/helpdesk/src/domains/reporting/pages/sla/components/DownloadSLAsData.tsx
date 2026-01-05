import { logEvent, SegmentEvent } from '@repo/logging'

import { useDownloadSLAsData } from 'domains/reporting/hooks/sla/useDownloadSLAsData'
import { DownloadSLAsDataButton } from 'domains/reporting/pages/sla/components/DownloadSLAsDataButton'
import { saveZippedFiles } from 'utils/file'

type Props = {
    children: React.ReactNode
}

export const DownloadSLAsData = ({ children }: Props) => {
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
        >
            {children}
        </DownloadSLAsDataButton>
    )
}
