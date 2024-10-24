import React, {ComponentProps} from 'react'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {BannerType} from 'pages/convert/campaigns/types/CampaignFormConfiguration'
import {sanitizeHtmlDefault} from 'utils/html'

type OwnProps = {
    type: string
    text: string
} & Omit<ComponentProps<typeof Alert>, 'children' | 'type'>

const bannerType: Record<string, AlertType> = {
    [BannerType.Warning]: AlertType.Warning,
    [BannerType.Info]: AlertType.Info,
}

const ConvertInfoBanner = ({type, text, ...props}: OwnProps) => {
    return (
        <Alert icon type={bannerType[type]} {...props}>
            <span
                dangerouslySetInnerHTML={{
                    __html: sanitizeHtmlDefault(text),
                }}
            />
        </Alert>
    )
}

export default ConvertInfoBanner
