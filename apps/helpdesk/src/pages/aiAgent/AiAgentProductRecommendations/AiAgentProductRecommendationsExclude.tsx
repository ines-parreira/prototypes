import { Link, useParams } from 'react-router-dom'

import { Button } from '@gorgias/merchant-ui-kit'

import useAppSelector from 'hooks/useAppSelector'
import { useUpsertRulesProductRecommendation } from 'models/knowledgeService/mutations'
import { useGetRulesProductRecommendation } from 'models/knowledgeService/queries'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { AiAgentLayout } from '../components/AiAgentLayout/AiAgentLayout'
import { PRODUCT_RECOMMENDATIONS } from '../constants'
import { useAiAgentNavigation } from '../hooks/useAiAgentNavigation'
import { ProductRecommendationRuleCard } from './components/ProductRecommendationRuleCard'
import { TagRecommendationRuleCard } from './components/TagRecommendationRuleCard'
import { VendorRecommendationRuleCard } from './components/VendorRecommendationRuleCard'

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

    const excludedProductIds =
        productRecommendationRules?.excluded.flatMap((rule) =>
            rule.type === 'product'
                ? rule.items.map((item) => item.target)
                : [],
        ) || []

    const excludedTags =
        productRecommendationRules?.excluded.flatMap((rule) =>
            rule.type === 'tag' ? rule.items.map((item) => item.target) : [],
        ) || []

    const excludedVendors =
        productRecommendationRules?.excluded.flatMap((rule) =>
            rule.type === 'vendor' ? rule.items.map((item) => item.target) : [],
        ) || []

    const handleUpsert = async (
        targets: string[],
        type: 'product' | 'tag' | 'vendor',
    ) =>
        upsertProductRecommendationRules({
            integrationId: integrationId,
            data: {
                gorgiasDomain,
                recommendationAction: 'excluded',
                rules: [
                    ...(productRecommendationRules?.excluded ?? []).filter(
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
            title={PRODUCT_RECOMMENDATIONS}
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
                type="exclude"
                integrationId={integrationId}
                productIds={excludedProductIds}
                isLoadingRules={isLoadingRules}
                isFetchingRules={isFetchingRules}
                isUpserting={isUpserting}
                onUpsert={(productIds) => handleUpsert(productIds, 'product')}
            />

            <TagRecommendationRuleCard
                type="exclude"
                integrationId={integrationId}
                tags={excludedTags}
                isLoadingRules={isLoadingRules}
                isFetchingRules={isFetchingRules}
                isUpserting={isUpserting}
                onUpsert={(tags) => handleUpsert(tags, 'tag')}
            />

            <VendorRecommendationRuleCard
                type="exclude"
                integrationId={integrationId}
                vendors={excludedVendors}
                isLoadingRules={isLoadingRules}
                isFetchingRules={isFetchingRules}
                isUpserting={isUpserting}
                onUpsert={(vendors) => handleUpsert(vendors, 'vendor')}
            />
        </AiAgentLayout>
    )
}
