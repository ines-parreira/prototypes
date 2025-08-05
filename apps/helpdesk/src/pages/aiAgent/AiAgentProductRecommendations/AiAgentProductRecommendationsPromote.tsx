import { useParams } from 'react-router-dom'

import { UpsertProductRecommendationRulesRulesItem } from '@gorgias/knowledge-service-types'

import useAppSelector from 'hooks/useAppSelector'
import { useUpsertRulesProductRecommendation } from 'models/knowledgeService/mutations'
import { useGetRulesProductRecommendation } from 'models/knowledgeService/queries'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { AiAgentLayout } from '../components/AiAgentLayout/AiAgentLayout'
import { PRODUCT_RECOMMENDATIONS } from '../constants'
import { ProductRecommendationRuleCard } from './components/ProductRecommendationRuleCard'
import { TagRecommendationRuleCard } from './components/TagRecommendationRuleCard'

import css from './AiAgentProductRecommendations.less'

export const AiAgentProductRecommendationsPromote = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()

    const currentAccount = useAppSelector(getCurrentAccountState)
    const gorgiasDomain = currentAccount.get('domain')
    const { integrationId } = useShopifyIntegrationAndScope(shopName)

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

    const handleUpsert = async (
        rules: UpsertProductRecommendationRulesRulesItem[],
    ) =>
        upsertProductRecommendationRules({
            integrationId: integrationId,
            data: {
                gorgiasDomain,
                recommendationAction: 'promoted',
                rules,
            },
        })

    return (
        <AiAgentLayout
            shopName={shopName}
            title={PRODUCT_RECOMMENDATIONS}
            className={css.container}
        >
            <ProductRecommendationRuleCard
                type="promote"
                integrationId={integrationId}
                productIds={promotedProductIds}
                isLoadingRules={isLoadingRules}
                isFetchingRules={isFetchingRules}
                isUpserting={isUpserting}
                onUpsert={async (productIds) => {
                    await handleUpsert([
                        {
                            type: 'product',
                            items: productIds.map((productId) => ({
                                target: productId,
                            })),
                        },
                        {
                            type: 'tag',
                            items: promotedTags.map((tag) => ({
                                target: tag,
                            })),
                        },
                    ])
                }}
            />

            <TagRecommendationRuleCard
                type="promote"
                integrationId={integrationId}
                tags={promotedTags}
                isLoadingRules={isLoadingRules}
                isFetchingRules={isFetchingRules}
                isUpserting={isUpserting}
                onUpsert={async (tags) => {
                    await handleUpsert([
                        {
                            type: 'product',
                            items: promotedProductIds.map((productId) => ({
                                target: productId,
                            })),
                        },
                        {
                            type: 'tag',
                            items: tags.map((tag) => ({
                                target: tag,
                            })),
                        },
                    ])
                }}
            />
        </AiAgentLayout>
    )
}
