import {Map} from 'immutable'
import React from 'react'

import LinkButton from 'pages/common/components/button/LinkButton'

import useShopifyCheckoutChatInstallation from '../hooks/useShopifyCheckoutChatInstallation'

import css from './GorgiasChatIntegrationShopifyCheckoutChatInstallationCard.less'

type CardSubtextProps = {
    isOneClickInstallation: boolean
    installedOnShopifyCheckout: boolean
}

const CardSubtext = ({
    isOneClickInstallation,
    installedOnShopifyCheckout,
}: CardSubtextProps) => {
    if (installedOnShopifyCheckout) {
        return (
            <div>
                Manage Chat on the Checkout and Thank You pages via the Shopify
                Checkout editor.
            </div>
        )
    }

    if (!isOneClickInstallation) {
        return (
            <div>
                First, install Chat using the quick installation method above.
            </div>
        )
    }

    return (
        <div>
            Add Chat to the Checkout (Shopify Plus and Enterprise merchants
            only) and Thank You pages (all merchants) via the Shopify Checkout
            editor.
        </div>
    )
}

type Props = {
    integration: Map<any, any>
    isOneClickInstallation: boolean
}

const GorgiasChatIntegrationShopifyCheckoutChatInstallationCard = ({
    integration,
    isOneClickInstallation,
}: Props) => {
    const {installedOnShopifyCheckout, shopifyCheckoutChatInstallationUrl} =
        useShopifyCheckoutChatInstallation(integration)

    return (
        <div className={css.container}>
            <div className={css.header}>
                <div className={css.leftSection}>
                    {installedOnShopifyCheckout && (
                        <div className={css.installedIcon}>
                            <i
                                className="material-icons text-success"
                                style={{fontSize: 24}}
                            >
                                check_circle
                            </i>
                        </div>
                    )}
                    <div>
                        <div className={css.title}>
                            Shopify Checkout and Thank You pages
                        </div>
                        <CardSubtext
                            installedOnShopifyCheckout={
                                installedOnShopifyCheckout
                            }
                            isOneClickInstallation={isOneClickInstallation}
                        />
                    </div>
                </div>
                {isOneClickInstallation &&
                    shopifyCheckoutChatInstallationUrl && (
                        <div>
                            <LinkButton
                                intent="primary"
                                href={shopifyCheckoutChatInstallationUrl}
                                className="gap-2"
                            >
                                <span>
                                    {installedOnShopifyCheckout
                                        ? 'Manage'
                                        : 'Install'}
                                </span>
                                {installedOnShopifyCheckout && (
                                    <div className={css.externalIcon}>
                                        <i
                                            className="material-icons"
                                            style={{fontSize: 24}}
                                        >
                                            open_in_new
                                        </i>
                                    </div>
                                )}
                            </LinkButton>
                        </div>
                    )}
            </div>
        </div>
    )
}

export default GorgiasChatIntegrationShopifyCheckoutChatInstallationCard
