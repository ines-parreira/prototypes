import type { Map } from 'immutable'

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
                Manage Chat on the checkout and thank you pages via the Shopify
                checkout editor.
            </div>
        )
    }

    if (!isOneClickInstallation) {
        return (
            <div>
                You must use the quick installation method to add Chat to
                Shopify before you can access this option.
            </div>
        )
    }

    return (
        <div>
            Add Chat to your checkout and thank you pages via the Shopify
            checkout editor.{' '}
            <a
                href="https://link.gorgias.com/wzv"
                target="_blank"
                rel="noopener noreferrer"
            >
                Learn more.
            </a>
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
    const { installedOnShopifyCheckout, shopifyCheckoutChatInstallationUrl } =
        useShopifyCheckoutChatInstallation(integration)

    return (
        <div className={css.container}>
            <div className={css.header}>
                <div className={css.leftSection}>
                    {installedOnShopifyCheckout && (
                        <div className={css.installedIcon}>
                            <i
                                className="material-icons text-success"
                                style={{ fontSize: 24 }}
                            >
                                check_circle
                            </i>
                        </div>
                    )}
                    <div>
                        <div className={css.title}>
                            Shopify checkout and thank you pages
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
                                <div className={css.externalIcon}>
                                    <i
                                        className="material-icons"
                                        style={{ fontSize: 24 }}
                                    >
                                        open_in_new
                                    </i>
                                </div>
                            </LinkButton>
                        </div>
                    )}
            </div>
        </div>
    )
}

export default GorgiasChatIntegrationShopifyCheckoutChatInstallationCard
