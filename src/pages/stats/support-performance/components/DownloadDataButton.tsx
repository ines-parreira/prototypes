import React from 'react'

import Button from 'pages/common/components/button/Button'
import { DOWNLOAD_DATA_BUTTON_LABEL } from 'pages/stats/constants'

type Props = {
    disabled: boolean
    onClick: () => void
    title: string
}

export const DownloadDataButton = ({ disabled, onClick, title }: Props) => {
    return (
        <Button
            intent="secondary"
            fillStyle="ghost"
            onClick={onClick}
            isDisabled={disabled}
            title={title}
            leadingIcon="file_download"
        >
            {DOWNLOAD_DATA_BUTTON_LABEL}
        </Button>
    )
}
