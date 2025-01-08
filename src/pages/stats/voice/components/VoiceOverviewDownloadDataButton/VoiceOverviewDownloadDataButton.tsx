import React from 'react'

import Button from 'pages/common/components/button/Button'
import {
    DOWNLOAD_BUTTON_TITLE,
    DOWNLOAD_DATA_BUTTON_LABEL,
} from 'pages/stats/voice/constants/voiceOverview'

type Props = {
    disabled: boolean
    onClick: () => void
}

export const VoiceOverviewDownloadDataButton = ({disabled, onClick}: Props) => {
    return (
        <Button
            intent="secondary"
            fillStyle="ghost"
            onClick={onClick}
            isDisabled={disabled}
            title={DOWNLOAD_BUTTON_TITLE}
            leadingIcon="file_download"
        >
            {DOWNLOAD_DATA_BUTTON_LABEL}
        </Button>
    )
}
