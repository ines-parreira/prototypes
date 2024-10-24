import React from 'react'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {DOWNLOAD_DATA_BUTTON_LABEL} from 'pages/stats/constants'

const DOWNLOAD_BUTTON_TITLE = 'Download Performance Overview Data'

type Props = {
    disabled: boolean
    onClick: () => void
}

export const DownloadOverviewDataButton = ({disabled, onClick}: Props) => {
    return (
        <Button
            intent="secondary"
            fillStyle="ghost"
            onClick={onClick}
            isDisabled={disabled}
            title={DOWNLOAD_BUTTON_TITLE}
        >
            <ButtonIconLabel icon="file_download">
                {DOWNLOAD_DATA_BUTTON_LABEL}
            </ButtonIconLabel>
        </Button>
    )
}
