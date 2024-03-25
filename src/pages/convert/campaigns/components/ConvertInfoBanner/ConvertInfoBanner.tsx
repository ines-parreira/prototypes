import React from 'react'
import {sanitizeHtmlDefault} from 'utils/html'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {BannerType} from 'pages/convert/campaigns/types/CampaignFormConfiguration'

type OwnProps = {
    type: string
    text: string
}

const bannerType: Record<string, AlertType> = {
    [BannerType.Warning]: AlertType.Warning,
    [BannerType.Info]: AlertType.Info,
}

const ConvertInfoBanner = ({type, text}: OwnProps) => {
    return (
        <Alert icon type={bannerType[type]}>
            <span
                dangerouslySetInnerHTML={{
                    __html: sanitizeHtmlDefault(text),
                }}
            ></span>
        </Alert>
    )
}

export default ConvertInfoBanner
