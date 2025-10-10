import { FeatureFlagKey } from '@repo/feature-flags'
import { Link, useParams } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { useUpsertRulesProductRecommendation } from 'models/knowledgeService/mutations'
import { useGetRulesProductRecommendation } from 'models/knowledgeService/queries'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { AiAgentLayout } from '../components/AiAgentLayout/AiAgentLayout'
import { PRODUCT_RECOMMENDATIONS, SALES } from '../constants'
import { useAiAgentNavigation } from '../hooks/useAiAgentNavigation'
import { CollectionRecommendationRuleCard } from './components/CollectionRecommendationRuleCard'
import { ProductRecommendationRuleCard } from './components/ProductRecommendationRuleCard'
import { TagRecommendationRuleCard } from './components/TagRecommendationRuleCard'
import { VendorRecommendationRuleCard } from './components/VendorRecommendationRuleCard'
import { ProductRecommendationRuleType } from './types'

import css from './AiAgentProductRecommendations.less'

export const AiAgentProductRecommendationsPromote = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()

    const currentAccount = useAppSelector(getCurrentAccountState)
    const gorgiasDomain = currentAccount.get('domain')
    const { integrationId } = useShopifyIntegrationAndScope(shopName)
    const { routes } = useAiAgentNavigation({ shopName })

    const collectionRulesEnabled = useFlag(
        FeatureFlagKey.AiAgentProductRecommendationsCollectionRules,
    )

    const {
        data: productRecommendationRules,
        isLoading: isLoadingRules,
        isFetching: isFetchingRules,
    } = useGetRulesProductRecommendation(integrationId!)

    const {
        mutateAsync: upsertProductRecommendationRules,
        isLoading: isUpserting,
    } = useUpsertRulesProductRecommendation(integrationId!)

    if (!integrationId) {
        return <></>
    }

    const promotedProductIds =
        productRecommendationRules?.promoted.flatMap((rule) =>
            rule.type === 'product'
                ? rule.items.map((item) => item.target)
                : [],
        ) || []

    const promotedTags =
        productRecommendationRules?.promoted.flatMap((rule) =>
            rule.type === 'tag' ? rule.items.map((item) => item.target) : [],
        ) || []

    const promotedVendors =
        productRecommendationRules?.promoted.flatMap((rule) =>
            rule.type === 'vendor' ? rule.items.map((item) => item.target) : [],
        ) || []

    const promotedCollections =
        productRecommendationRules?.promoted.flatMap((rule) =>
            rule.type === 'collection'
                ? rule.items.map((item) => item.target)
                : [],
        ) || []

    const handleUpsert = async (
        targets: string[],
        type: ProductRecommendationRuleType,
    ) =>
        upsertProductRecommendationRules({
            integrationId: integrationId,
            data: {
                gorgiasDomain,
                recommendationAction: 'promoted',
                rules: [
                    ...(productRecommendationRules?.promoted ?? []).filter(
                        (rule) => rule.type !== type,
                    ),
                    {
                        type,
                        items: targets.map((target) => ({ target })),
                    },
                ],
            },
        })

    return (
        <AiAgentLayout
            shopName={shopName}
            title={SALES}
            className={css.container}
        >
            <Link to={routes.productRecommendations}>
                <Button
                    fillStyle="ghost"
                    intent="secondary"
                    leadingIcon="arrow_back"
                >
                    Back to {PRODUCT_RECOMMENDATIONS}
                </Button>
            </Link>

            <ProductRecommendationRuleCard
                type="promote"
                integrationId={integrationId}
                productIds={promotedProductIds}
                isLoadingRules={isLoadingRules}
                isFetchingRules={isFetchingRules}
                isUpserting={isUpserting}
                onUpsert={(productIds) => handleUpsert(productIds, 'product')}
            />

            <TagRecommendationRuleCard
                type="promote"
                integrationId={integrationId}
                tags={promotedTags}
                isLoadingRules={isLoadingRules}
                isFetchingRules={isFetchingRules}
                isUpserting={isUpserting}
                onUpsert={(tags) => handleUpsert(tags, 'tag')}
            />

            <VendorRecommendationRuleCard
                type="promote"
                integrationId={integrationId}
                vendors={promotedVendors}
                isLoadingRules={isLoadingRules}
                isFetchingRules={isFetchingRules}
                isUpserting={isUpserting}
                onUpsert={(vendors) => handleUpsert(vendors, 'vendor')}
            />

            {collectionRulesEnabled && (
                <CollectionRecommendationRuleCard
                    type="promote"
                    integrationId={integrationId}
                    collections={promotedCollections}
                    isLoadingRules={isLoadingRules}
                    isFetchingRules={isFetchingRules}
                    isUpserting={isUpserting}
                    onUpsert={(collections) =>
                        handleUpsert(collections, 'collection')
                    }
                />
            )}
        </AiAgentLayout>
    )
}
