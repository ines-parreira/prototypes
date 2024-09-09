import React, {useMemo} from 'react'

import {useHelpCenterList} from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import {IntegrationType} from 'models/integration/constants'
import {useShopifyIntegrationAndScope} from 'pages/common/hooks/useShopifyIntegrationAndScope'
import {useHelpCentersArticleCount} from '../common/hooks/useHelpCentersArticleCount'

import {useHasEmailToStoreConnection} from '../common/components/TopQuestions/useHasEmailToStoreConnection'
import useSelfServiceStoreIntegration from '../common/hooks/useSelfServiceStoreIntegration'
import {
    AiAgentWelcomePageProps,
    AIAgentWelcomePageView,
    DynamicItem,
} from './components/AIAgentWelcomePageView/AIAgentWelcomePageView'
import {READ_FULFILLMENTS_PERMISSION} from './AiAgentConfigurationView/AiAgentConfigurationView'

type Props = AiAgentWelcomePageProps & {
    state: 'dynamic' | 'onboardingWizard'
}

export const AIAgentWelcomePageDynamic = ({
    shopType,
    shopName,
    storeConfiguration,
    state,
}: Props) => {
    const isOnboardingWizard = state === 'onboardingWizard'

    // Check - Shopify integration permission
    const {integration: shopifyIntegration} =
        useShopifyIntegrationAndScope(shopName)

    const shopifyPermissionUpdated = useMemo(() => {
        if (!isOnboardingWizard || !shopifyIntegration) return undefined

        const shopifyNeedPermissions =
            !shopifyIntegration.meta.oauth.scope.includes(
                READ_FULFILLMENTS_PERMISSION
            )

        if (shopifyNeedPermissions) {
            return {
                checked: false,
                link: `/api/integrations/${shopifyIntegration.id}/sync_permissions`,
            }
        }

        return {checked: true}
    }, [isOnboardingWizard, shopifyIntegration])

    // Check - Email integrations
    const storeIntegration = useSelfServiceStoreIntegration(
        IntegrationType.Shopify,
        shopName
    )

    const {
        isLoading: isHasEmailToStoreConnectionLoading,
        hasEmailToStoreConnection,
    } = useHasEmailToStoreConnection(storeIntegration?.id)

    // Check - Help Center
    const helpCenterList = useHelpCenterList({shop_name: shopName})

    const helpCentersConnectedToStoreIds = useMemo(
        () =>
            helpCenterList.isLoading
                ? undefined
                : helpCenterList.helpCenters
                      .filter((helpCenter) => helpCenter.shop_name === shopName)
                      .map((helpCenter) => helpCenter.id),
        [helpCenterList.helpCenters, helpCenterList.isLoading, shopName]
    )

    // Check 20 articles
    const helpCentersArticlesCount = useHelpCentersArticleCount(
        helpCentersConnectedToStoreIds
    )

    const has20Articles: DynamicItem | undefined = useMemo(() => {
        if (helpCentersArticlesCount === undefined) return undefined

        if (helpCentersArticlesCount.length === 0) {
            return {
                checked: false,
                link: '/app/settings/help-center/new',
            }
        }

        if (
            helpCentersArticlesCount.some(
                (x) => x.count !== undefined && x.count >= 20
            )
        ) {
            return {checked: true}
        }

        return {
            checked: false,
            link:
                helpCentersArticlesCount.length === 1
                    ? '/app/settings/help-center/{id}/ai-library'.replace(
                          '{id}',
                          helpCentersArticlesCount[0].helpCenterId.toString()
                      )
                    : '/app/settings/help-center',
        }
    }, [helpCentersArticlesCount])

    if (
        isHasEmailToStoreConnectionLoading === true ||
        helpCentersConnectedToStoreIds === undefined ||
        has20Articles === undefined
    ) {
        return (
            <AIAgentWelcomePageView
                state="loading"
                shopType={shopType}
                shopName={shopName}
            />
        )
    }

    return (
        <AIAgentWelcomePageView
            state={state}
            shopType={shopType}
            shopName={shopName}
            storeConfiguration={storeConfiguration}
            emailConnected={
                hasEmailToStoreConnection
                    ? {checked: true}
                    : {
                          checked: false,
                          link: '/app/settings/channels/email',
                      }
            }
            helpCenterCreated={
                helpCentersConnectedToStoreIds.length !== 0
                    ? {checked: true}
                    : {
                          checked: false,
                          link: '/app/settings/help-center/new',
                      }
            }
            helpCenter20Articles={has20Articles}
            shopifyPermissionUpdated={shopifyPermissionUpdated}
        />
    )
}
