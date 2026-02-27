import { useMemo } from 'react'

import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'

import {
    Button,
    ButtonAs,
    ButtonIntent,
    ButtonVariant,
    Card,
    Elevation,
    Heading,
    HeadingSize,
    Icon,
    IconName,
    Text,
    TextSize,
    TextVariant,
} from '@gorgias/axiom'
import { IntegrationType } from '@gorgias/helpdesk-types'

import useAppSelector from 'hooks/useAppSelector'
import useChatMigrationBanner from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useChatMigrationBanner'
import useShopifyCheckoutChatInstallation from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShopifyCheckoutChatInstallation'
import useThemeAppExtensionInstallation from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useThemeAppExtensionInstallation'
import OneClickInstall from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationInstall/InstallationCard/OneClickInstall'
import StoreController from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationInstall/InstallationCard/StoreController'
import { getStoreIntegrations } from 'state/integrations/selectors'

import css from './InstallationCard.less'

type Props = {
    integration: Map<any, any>
    actions: {
        updateOrCreateIntegration: any
    }
}

const InstallationCard = ({
    integration,
    actions: { updateOrCreateIntegration },
}: Props) => {
    const storeIntegrations = useAppSelector(getStoreIntegrations)
    const shopIntegrationId = integration.getIn(['meta', 'shop_integration_id'])
    const shopifyIntegrationIds: List<number> = integration.getIn(
        ['meta', 'shopify_integration_ids'],
        fromJS([]),
    )

    const storeIntegration = shopIntegrationId
        ? storeIntegrations.find(
              (storeIntegration) => storeIntegration.id === shopIntegrationId,
          )
        : undefined
    const { installedOnShopifyCheckout, shopifyCheckoutChatInstallationUrl } =
        useShopifyCheckoutChatInstallation(integration)

    const isConnected = Boolean(storeIntegration)
    const isConnectedToShopify =
        storeIntegration?.type === IntegrationType.Shopify

    const { hasShopifyScriptTagScope } = useChatMigrationBanner(integration)
    const {
        shouldUseThemeAppExtensionInstallation,
        themeAppExtensionInstallationUrl,
    } = useThemeAppExtensionInstallation(
        isConnectedToShopify ? storeIntegration : undefined,
    )

    const isOneClickInstallation = useMemo(() => {
        const isOneClickInstallation = Boolean(
            shopIntegrationId
                ? shopifyIntegrationIds.includes(shopIntegrationId)
                : undefined,
        )

        return isConnected && isOneClickInstallation
    }, [shopIntegrationId, shopifyIntegrationIds, isConnected])

    const cardDescription = useMemo(() => {
        if (installedOnShopifyCheckout) {
            return 'Manage Chat on the checkout and thank you pages via the Shopify checkout editor.'
        }
        if (!isOneClickInstallation) {
            return 'You must use the quick installation method to add Chat to Shopify before you can access this option.'
        }
        return (
            <>
                Add Chat to your checkout and thank you pages via the Shopify
                checkout editor.{' '}
                <a
                    href="https://link.gorgias.com/wzv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={css.iconLink}
                >
                    Learn more <Icon name={IconName.ExternalLink} />
                </a>
            </>
        )
    }, [isOneClickInstallation, installedOnShopifyCheckout])

    return (
        <Card elevation={Elevation.Mid}>
            <div className={css.installationCard}>
                <div>
                    <Heading size={HeadingSize.Md}>
                        Install on Shopify stores
                    </Heading>
                </div>
                <div className={css.storeController}>
                    <div className={css.description}>
                        <Text size={TextSize.Md} variant={TextVariant.Medium}>
                            Connect store
                        </Text>
                        <Text size={TextSize.Sm} variant={TextVariant.Regular}>
                            Select your Shopify store and connect it to Gorgias.
                        </Text>
                    </div>
                    <div>
                        <StoreController
                            integration={integration}
                            storeIntegration={storeIntegration}
                            storeIntegrations={storeIntegrations}
                            isOneClickInstallation={isOneClickInstallation}
                        />
                    </div>
                </div>
                <div>
                    <OneClickInstall
                        integration={integration}
                        updateOrCreateIntegration={updateOrCreateIntegration}
                        themeAppExtensionInstallation={
                            shouldUseThemeAppExtensionInstallation
                        }
                        themeAppExtensionInstallationUrl={
                            themeAppExtensionInstallationUrl
                        }
                        isConnected={isConnected}
                        isInstalled={isOneClickInstallation}
                        hasShopifyScriptTagScope={hasShopifyScriptTagScope}
                    ></OneClickInstall>
                </div>
                <div className={css.checkoutAndThankYouPages}>
                    <div className={css.description}>
                        <Text size={TextSize.Md} variant={TextVariant.Medium}>
                            Shopify checkout and thank you pages
                        </Text>
                        <Text size={TextSize.Sm} variant={TextVariant.Regular}>
                            {cardDescription}
                        </Text>
                    </div>
                    {isOneClickInstallation &&
                        shopifyCheckoutChatInstallationUrl && (
                            <div>
                                <a
                                    href={shopifyCheckoutChatInstallationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button
                                        intent={ButtonIntent.Regular}
                                        variant={ButtonVariant.Secondary}
                                        as={ButtonAs.Anchor}
                                        trailingSlot={IconName.ExternalLink}
                                    >
                                        <Text
                                            variant={TextVariant.Bold}
                                            size={TextSize.Md}
                                        >
                                            {installedOnShopifyCheckout
                                                ? 'Manage'
                                                : 'Install'}
                                        </Text>
                                    </Button>
                                </a>
                            </div>
                        )}
                </div>
            </div>
        </Card>
    )
}

export default InstallationCard
