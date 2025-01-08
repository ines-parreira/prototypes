import React from 'react'

import Button from 'pages/common/components/button/Button'
import {DOWNLOAD_DATA_BUTTON_LABEL} from 'pages/stats/constants'

const DOWNLOAD_BUTTON_TITLE = 'Download Performance Overview Data'

type Props = {
    disabled: boolean
    onClick: () => void
}

export const DownloadDataButton = ({disabled, onClick}: Props) => {
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
