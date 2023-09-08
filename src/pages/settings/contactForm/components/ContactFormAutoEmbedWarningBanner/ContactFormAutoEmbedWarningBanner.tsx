import React from 'react'
import {Link} from 'react-router-dom'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import {
    linkToContactFormPreferences,
    linkToShopifyIntegration,
} from 'pages/settings/contactForm/utils/navigation'
import {ContactFormAutoEmbedReadinessStatus} from '../ContactFormAutoEmbedPublishSection/types'
import css from './ContactFormAutoEmbedWarningBanner.less'

export type ContactFormAutoEmbedWarningBannerProps = {
    details?: {
        type: ContactFormAutoEmbedReadinessStatus
        entityId: number
    }
}

const ContactFormAutoEmbedWarningBanner = (
    props: ContactFormAutoEmbedWarningBannerProps
) => {
    const {details} = props

    const [isConnectDismissed, setIsConnectDismissed] = React.useState(false)
    const [isPermissionDismissed, setPermissionDismissed] =
        React.useState(false)

    if (!details) return null

    const {type, entityId} = details

    if (
        type === ContactFormAutoEmbedReadinessStatus.NOT_CONNECTED &&
        !isConnectDismissed
    ) {
        // not connected to any store
        return (
            <Alert
                icon
                type={AlertType.Warning}
                onClose={() => {
                    setIsConnectDismissed(true)
                }}
            >
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div style={{display: 'inline-block'}}>
                        Connect Shopify to enable auto-embedding to your
                        website.
                    </div>
                    <div style={{display: 'inline-block'}}>
                        <Link
                            target="_blank"
                            to={linkToContactFormPreferences(entityId)}
                        >
                            <span className={css.connectShopifyBtn}>
                                Connect Shopify
                            </span>
                        </Link>
                    </div>
                </div>
            </Alert>
        )
    }

    if (
        type === ContactFormAutoEmbedReadinessStatus.NEED_PERMISSION_UPDATE &&
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
                To use the auto-embed feature for your form,{' '}
                <Link to={linkToShopifyIntegration(entityId)}>
                    update your Shopify app permissions
                </Link>
                .
            </Alert>
        )
    }

    return null
}

export default ContactFormAutoEmbedWarningBanner
