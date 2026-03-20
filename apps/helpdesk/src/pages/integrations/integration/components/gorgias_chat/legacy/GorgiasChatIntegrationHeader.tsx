import type { Map } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { useInstallationStatus } from 'pages/integrations/integration/components/gorgias_chat/hooks/useInstallationStatus'
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
    const appId: string | undefined = integration.getIn(['meta', 'app_id'])
    const { installed } = useInstallationStatus(appId)
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
