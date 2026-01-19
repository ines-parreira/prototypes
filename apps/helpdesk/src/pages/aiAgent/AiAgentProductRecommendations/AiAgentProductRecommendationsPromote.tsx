import { Link, useParams } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import { useUpsertRulesProductRecommendation } from 'models/knowledgeService/mutations'
import { useGetRulesProductRecommendation } from 'models/knowledgeService/queries'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'

import { AiAgentLayout } from '../components/AiAgentLayout/AiAgentLayout'
import { PRODUCT_RECOMMENDATIONS, SALES } from '../constants'
import { useAiAgentNavigation } from '../hooks/useAiAgentNavigation'
import { CollectionRecommendationRuleCard } from './components/CollectionRecommendationRuleCard'
import { ProductRecommendationRuleCard } from './components/ProductRecommendationRuleCard'
import { TagRecommendationRuleCard } from './components/TagRecommendationRuleCard'
import { VendorRecommendationRuleCard } from './components/VendorRecommendationRuleCard'
import usePaginatedProductsByIds from './hooks/usePaginatedProductsByIds'
import type { ProductRecommendationRuleType } from './types'
import { formatProductRecommendationRules } from './utils/format-product-recommendation-rules'

import css from './AiAgentProductRecommendations.less'

export const AiAgentProductRecommendationsPromote = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()

    const { integrationId } = useShopifyIntegrationAndScope(shopName)
    const { routes } = useAiAgentNavigation({ shopName })

    const {
        data: rawProductRecommendationRules,
        isLoading: isLoadingRules,
        isFetching: isFetchingRules,
    } = useGetRulesProductRecommendation(integrationId!)

    const productRecommendationRules = formatProductRecommendationRules(
        rawProductRecommendationRules,
    )

    const {
        mutateAsync: upsertProductRecommendationRules,
        isLoading: isUpserting,
    } = useUpsertRulesProductRecommendation(integrationId!)

    const { allProducts: allExcludedProducts } = usePaginatedProductsByIds({
        integrationId: integrationId!,
        productIds: productRecommendationRules.exclude.productIds,
        enabled: true,
        fetchAll: true,
    })

    if (!integrationId) {
        return <></>
    }

    const tagsWithExcludedProducts = allExcludedProducts
        .map((product) => product.tags?.split(', ') ?? [])
        .flat()

    const vendorsWithExcludedProducts = allExcludedProducts
        .map((product) => (product.vendor ? [product.vendor] : []))
        .flat()

    const handleUpsert = async (
        targets: string[],
        type: ProductRecommendationRuleType,
    ) => {
        await upsertProductRecommendationRules({
            integrationId: integrationId,
            data: {
                recommendationAction: 'promoted',
                rules: [
                    ...(rawProductRecommendationRules?.promoted ?? []).filter(
                        (rule) => rule.type !== type,
                    ),
                    {
                        type,
                        items: targets.map((target) => ({ target })),
                    },
                ],
            },
        })

        // Check for duplicates in the exluded rules
        const excludedRules = rawProductRecommendationRules?.excluded.find(
            (rule) => rule.type === type,
        )
        if (!excludedRules) return

        const filtered = excludedRules.items.filter(
            (item) => !targets.includes(item.target),
        )
        if (filtered.length !== excludedRules.items.length) {
            await upsertProductRecommendationRules({
                integrationId: integrationId,
                data: {
                    recommendationAction: 'excluded',
                    rules: [
                        ...(
                            rawProductRecommendationRules?.excluded ?? []
                        ).filter((rule) => rule.type !== type),
                        {
                            type,
                            items: filtered,
                        },
                    ],
                },
            })
        }
    }

    return (
        <AiAgentLayout
            shopName={shopName}
            title={SALES}
            className={css.container}
        >
            <div>
                <Link to={routes.productRecommendations}>
                    <Button
                        fillStyle="ghost"
                        intent="secondary"
                        leadingIcon="arrow_back"
                    >
                        Back to {PRODUCT_RECOMMENDATIONS}
                    </Button>
                </Link>
            </div>

            <ProductRecommendationRuleCard
                type="promote"
                integrationId={integrationId}
                rules={productRecommendationRules}
                isLoadingRules={isLoadingRules}
                isFetchingRules={isFetchingRules}
                isUpserting={isUpserting}
                onUpsert={(productIds) => handleUpsert(productIds, 'product')}
            />

            <TagRecommendationRuleCard
                type="promote"
                integrationId={integrationId}
                rules={productRecommendationRules}
                isLoadingRules={isLoadingRules}
                isFetchingRules={isFetchingRules}
                isUpserting={isUpserting}
                onUpsert={(tags) => handleUpsert(tags, 'tag')}
                tagsWithExceptions={tagsWithExcludedProducts}
            />

            <VendorRecommendationRuleCard
                type="promote"
                integrationId={integrationId}
                rules={productRecommendationRules}
                isLoadingRules={isLoadingRules}
                isFetchingRules={isFetchingRules}
                isUpserting={isUpserting}
                onUpsert={(vendors) => handleUpsert(vendors, 'vendor')}
                vendorsWithExceptions={vendorsWithExcludedProducts}
            />

            <CollectionRecommendationRuleCard
                type="promote"
                integrationId={integrationId}
                rules={productRecommendationRules}
                isLoadingRules={isLoadingRules}
                isFetchingRules={isFetchingRules}
                isUpserting={isUpserting}
                onUpsert={(collections) =>
                    handleUpsert(collections, 'collection')
                }
            />
        </AiAgentLayout>
    )
}
