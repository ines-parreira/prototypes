import { Button } from '@gorgias/axiom'

import { DOWNLOAD_DATA_BUTTON_LABEL } from 'domains/reporting/pages/constants'

export const DOWNLOAD_BUTTON_TITLE = 'Download SLAs Data'

type Props = {
    disabled: boolean
    onClick: () => void
}

export const DownloadSLAsDataButton = ({ disabled, onClick }: Props) => {
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
