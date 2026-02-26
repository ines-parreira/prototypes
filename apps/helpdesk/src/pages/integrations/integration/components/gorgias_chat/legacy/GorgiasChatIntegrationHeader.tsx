import type { Map } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { getChatInstallationStatus } from 'state/entities/chatInstallationStatus/selectors'
import { getShowShopifyCheckoutChatBanner } from 'state/integrations/selectors'

import type { Tab } from '../../../types'
import GorgiasChatIntegrationNavigation from './GorgiasChatIntegrationNavigation'
import GorgiasChatIntegrationNotInstalledBanner from './GorgiasChatIntegrationNotInstalledBanner'
import GorgiasChatIntegrationOutdatedSnippetBanner from './GorgiasChatIntegrationOutdatedSnippetBanner'
import GorgiasChatShopifyCheckoutBanner from './GorgiasChatShopifyCheckoutChatBanner'
import useChatMigrationBanner from './hooks/useChatMigrationBanner'
import { useShouldShowShopifyCheckoutChatBanner } from './hooks/useShouldShowShopifyCheckoutChatBanner'

type Props = {
    integration: Map<any, any>
    tab?: Tab
}

const GorgiasChatIntegrationHeader: React.FC<Props> = ({
    integration,
    tab,
}) => {
    const { installed } = useAppSelector(getChatInstallationStatus)
    const shopifyCheckoutBannerVisible = useAppSelector(
        getShowShopifyCheckoutChatBanner,
    )

    const { showThemeExtensionsMigrationBanner } =
        useChatMigrationBanner(integration)
    const shouldShowShopifyCheckoutBanner =
        useShouldShowShopifyCheckoutChatBanner(integration, tab)

    return (
        <>
            <GorgiasChatIntegrationNavigation integration={integration} />
            {installed ? (
                showThemeExtensionsMigrationBanner && (
                    <GorgiasChatIntegrationOutdatedSnippetBanner
                        integration={integration}
                    />
                )
            ) : (
                <GorgiasChatIntegrationNotInstalledBanner
                    integration={integration}
                    tab={tab}
                />
            )}
            {shopifyCheckoutBannerVisible &&
                shouldShowShopifyCheckoutBanner && (
                    <GorgiasChatShopifyCheckoutBanner
                        integration={integration}
                    />
                )}
        </>
    )
}

export default GorgiasChatIntegrationHeader
