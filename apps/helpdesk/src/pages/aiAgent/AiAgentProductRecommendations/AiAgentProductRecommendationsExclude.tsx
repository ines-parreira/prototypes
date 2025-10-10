import { Link, useParams } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { useUpsertRulesProductRecommendation } from 'models/knowledgeService/mutations'
import { useGetRulesProductRecommendation } from 'models/knowledgeService/queries'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { AiAgentLayout } from '../components/AiAgentLayout/AiAgentLayout'
import { PRODUCT_RECOMMENDATIONS, SALES } from '../constants'
import { useAiAgentNavigation } from '../hooks/useAiAgentNavigation'
import { CollectionRecommendationRuleCard } from './components/CollectionRecommendationRuleCard'
import { DoNotRecommendTagBanner } from './components/DoNotRecommendTagBanner'
import { ProductRecommendationRuleCard } from './components/ProductRecommendationRuleCard'
import { TagRecommendationRuleCard } from './components/TagRecommendationRuleCard'
import { VendorRecommendationRuleCard } from './components/VendorRecommendationRuleCard'
import usePaginatedProductsByIds from './hooks/usePaginatedProductsByIds'
import { ProductRecommendationRuleType } from './types'
import { formatProductRecommendationRules } from './utils/format-product-recommendation-rules'

import css from './AiAgentProductRecommendations.less'

export const AiAgentProductRecommendationsExclude = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()

    const currentAccount = useAppSelector(getCurrentAccountState)
    const gorgiasDomain = currentAccount.get('domain')
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

    const { allProducts: allPromotedProducts } = usePaginatedProductsByIds({
        integrationId: integrationId!,
        productIds: productRecommendationRules.promote.productIds,
        enabled: true,
        fetchAll: true,
    })

    if (!integrationId) {
        return <></>
    }

    const tagsWithPromotedProducts = allPromotedProducts
        .map((product) => product.tags?.split(', ') ?? [])
        .flat()

    const vendorsWithPromotedProducts = allPromotedProducts
        .map((product) => (product.vendor ? [product.vendor] : []))
        .flat()

    const handleUpsert = async (
        targets: string[],
        type: ProductRecommendationRuleType,
    ) => {
        await upsertProductRecommendationRules({
            integrationId: integrationId,
            data: {
                gorgiasDomain,
                recommendationAction: 'excluded',
                rules: [
                    ...(rawProductRecommendationRules?.excluded ?? []).filter(
                        (rule) => rule.type !== type,
                    ),
                    {
                        type,
                        items: targets.map((target) => ({ target })),
                    },
                ],
            },
        })

        // Check for duplicates in the promoted rules
        const promotedRules = rawProductRecommendationRules?.promoted.find(
            (rule) => rule.type === type,
        )
        if (!promotedRules) return

        const filtered = promotedRules.items.filter(
            (item) => !targets.includes(item.target),
        )
        if (filtered.length !== promotedRules.items.length) {
            await upsertProductRecommendationRules({
                integrationId: integrationId,
                data: {
                    gorgiasDomain,
                    recommendationAction: 'promoted',
                    rules: [
                        ...(
                            rawProductRecommendationRules?.promoted ?? []
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

            <DoNotRecommendTagBanner />

            <ProductRecommendationRuleCard
                type="exclude"
                integrationId={integrationId}
                rules={productRecommendationRules}
                isLoadingRules={isLoadingRules}
                isFetchingRules={isFetchingRules}
                isUpserting={isUpserting}
                onUpsert={(productIds) => handleUpsert(productIds, 'product')}
            />

            <TagRecommendationRuleCard
                type="exclude"
                integrationId={integrationId}
                rules={productRecommendationRules}
                isLoadingRules={isLoadingRules}
                isFetchingRules={isFetchingRules}
                isUpserting={isUpserting}
                onUpsert={(tags) => handleUpsert(tags, 'tag')}
                tagsWithExceptions={tagsWithPromotedProducts}
            />

            <VendorRecommendationRuleCard
                type="exclude"
                integrationId={integrationId}
                rules={productRecommendationRules}
                isLoadingRules={isLoadingRules}
                isFetchingRules={isFetchingRules}
                isUpserting={isUpserting}
                onUpsert={(vendors) => handleUpsert(vendors, 'vendor')}
                vendorsWithExceptions={vendorsWithPromotedProducts}
            />

            <CollectionRecommendationRuleCard
                type="exclude"
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
