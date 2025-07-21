import React, { useMemo } from 'react'

import { IntegrationType } from 'models/integration/constants'
import { useHasEmailToStoreConnection } from 'pages/automate/common/components/TopQuestions/useHasEmailToStoreConnection'
import { useHelpCentersArticleCount } from 'pages/automate/common/hooks/useHelpCentersArticleCount'
import useSelfServiceStoreIntegration from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import { useHelpCenterList } from 'pages/settings/helpCenter/hooks/useHelpCenterList'

import {
    AiAgentWelcomePageProps,
    AIAgentWelcomePageView,
    DynamicItem,
} from './components/AIAgentWelcomePageView/AIAgentWelcomePageView'

export const AIAgentWelcomePageDynamic = ({
    accountDomain,
    shopType,
    shopName,
    storeConfiguration,
}: AiAgentWelcomePageProps) => {
    // Check - Email integrations
    const storeIntegration = useSelfServiceStoreIntegration(
        IntegrationType.Shopify,
        shopName,
    )

    const { isLoading: isHasEmailToStoreConnectionLoading } =
        useHasEmailToStoreConnection(storeIntegration?.id)

    // Check - Help Center
    const helpCenterList = useHelpCenterList({ shop_name: shopName })

    const helpCentersConnectedToStoreIds = useMemo(
        () =>
            helpCenterList.isLoading
                ? undefined
                : helpCenterList.helpCenters
                      .filter((helpCenter) => helpCenter.shop_name === shopName)
                      .map((helpCenter) => helpCenter.id),
        [helpCenterList.helpCenters, helpCenterList.isLoading, shopName],
    )

    // Check 20 articles
    const helpCentersArticlesCount = useHelpCentersArticleCount(
        helpCentersConnectedToStoreIds,
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
                (x) => x.count !== undefined && x.count >= 20,
            )
        ) {
            return { checked: true }
        }

        return {
            checked: false,
            link:
                helpCentersArticlesCount.length === 1
                    ? '/app/settings/help-center/{id}/ai-library'.replace(
                          '{id}',
                          helpCentersArticlesCount[0].helpCenterId.toString(),
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
                accountDomain={accountDomain}
                shopType={shopType}
                shopName={shopName}
            />
        )
    }

    return (
        <AIAgentWelcomePageView
            accountDomain={accountDomain}
            shopType={shopType}
            shopName={shopName}
            storeConfiguration={storeConfiguration}
        />
    )
}
