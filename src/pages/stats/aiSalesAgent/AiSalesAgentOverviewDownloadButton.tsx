import React from 'react'

import Button from 'pages/common/components/button/Button'

const DOWNLOAD_DATA_BUTTON_LABEL = 'Download Data'

const AiSalesAgentOverviewDownloadButton = () => {
    return (
        <Button
            intent="secondary"
            fillStyle="ghost"
            onClick={async () => {}}
            title={DOWNLOAD_DATA_BUTTON_LABEL}
            leadingIcon="file_download"
        >
            {DOWNLOAD_DATA_BUTTON_LABEL}
        </Button>
    )
}

export default AiSalesAgentOverviewDownloadButton
