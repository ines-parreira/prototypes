import React from 'react'

import { Link } from 'react-router-dom'

import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import { linkToShopifyIntegration } from 'pages/settings/contactForm/utils/navigation'

import { HelpCenterAutoEmbedReadinessStatus } from '../HelpCenterAutoEmbedPublishSection/types'

export type HelpCenterAutoEmbedWarningBannerProps = {
    details?: {
        type: HelpCenterAutoEmbedReadinessStatus
        entityId: number
    }
}

const HelpCenterAutoEmbedWarningBanner = (
    props: HelpCenterAutoEmbedWarningBannerProps,
) => {
    const { details } = props

    const [isPermissionDismissed, setPermissionDismissed] =
        React.useState(false)

    if (!details) return null

    const { type, entityId } = details

    if (
        type === HelpCenterAutoEmbedReadinessStatus.NEED_PERMISSION_UPDATE &&
        !isPermissionDismissed
    ) {
        return (
            <Alert
                icon
                type={AlertType.Warning}
                onClose={() => {
                    setPermissionDismissed(true)
                }}
            >
                To use the auto-embed feature for your help center,{' '}
                <Link to={linkToShopifyIntegration(entityId)}>
                    update your Shopify app permissions
                </Link>
                .
            </Alert>
        )
    }

    return null
}

export default HelpCenterAutoEmbedWarningBanner
