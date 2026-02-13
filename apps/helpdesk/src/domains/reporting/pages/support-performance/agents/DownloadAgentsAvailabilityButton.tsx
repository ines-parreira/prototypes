import { useCallback, useMemo } from 'react'

import { DOWNLOAD_BUTTON_TITLES } from 'domains/reporting/pages/support-performance/agents/constants'
import { DownloadDataButton } from 'domains/reporting/pages/support-performance/components/DownloadDataButton'

export const DownloadAgentsAvailabilityButton = () => {
    const onClick = useCallback(async () => {}, [])
    const disabled = useMemo(() => false, [])
    return (
        <DownloadDataButton
            onClick={onClick}
            disabled={disabled}
            title={DOWNLOAD_BUTTON_TITLES.AGENT_AVAILABILITY}
        />
    )
}
