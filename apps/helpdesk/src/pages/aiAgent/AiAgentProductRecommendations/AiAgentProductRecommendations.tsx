import { Link, useParams } from 'react-router-dom'

import { Button, Skeleton } from '@gorgias/merchant-ui-kit'

import { useGetRulesProductRecommendation } from 'models/knowledgeService/queries'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { assetsUrl } from 'utils'

import { AiAgentLayout } from '../components/AiAgentLayout/AiAgentLayout'
import { PRODUCT_RECOMMENDATIONS } from '../constants'
import { useAiAgentNavigation } from '../hooks/useAiAgentNavigation'

import css from './AiAgentProductRecommendations.less'

export const AiAgentProductRecommendations = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()

    const { routes } = useAiAgentNavigation({ shopName })
    const { integrationId } = useShopifyIntegrationAndScope(shopName)

    const { data: productRecommendationRules } =
        useGetRulesProductRecommendation(integrationId!)

    return (
        <AiAgentLayout
            shopName={shopName}
            title={PRODUCT_RECOMMENDATIONS}
            className={css.container}
        >
            <div className={css.card}>
                <div>
                    <img
                        alt="Promote products"
                        src={assetsUrl(
                            '/img/ai-agent/ai_agent_product_recommendations_promote.png',
                        )}
                        className={css.image}
                    />
                </div>
                <div className={css.grow}>
                    <div className={css.description}>
                        <div className={css.title}>Promote products</div>
                        <div className={css.text}>
                            Prioritize the products you want the Shopping
                            Assistant to recommend more—like campaign items or
                            seasonal pushes. All products are recommended by
                            default.
                        </div>
                    </div>
                </div>
                <div>
                    {!productRecommendationRules ? (
                        <Skeleton width={120} height={32} />
                    ) : (
                        <Link to={routes.productRecommendationsPromote}>
                            <Button
                                intent="secondary"
                                fillStyle="ghost"
                                trailingIcon="chevron_right"
                            >
                                {productRecommendationRules.promoted.length > 0
                                    ? 'Manage'
                                    : 'Set Up'}
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className={css.card}>
                <div>
                    <img
                        alt="Exclude products"
                        src={assetsUrl(
                            '/img/ai-agent/ai_agent_product_recommendations_exclude.png',
                        )}
                        className={css.image}
                    />
                </div>
                <div className={css.grow}>
                    <div className={css.description}>
                        <div className={css.title}>Exclude products</div>
                        <div className={css.text}>
                            Prevent the Shopping Assistant from recommending
                            certain items. This is useful for low-stock items,
                            off-brand products, or restricted content you don’t
                            want surfaced.
                        </div>
                    </div>
                </div>
                <div>
                    {!productRecommendationRules ? (
                        <Skeleton width={120} height={32} />
                    ) : (
                        <Link to={routes.productRecommendationsExclude}>
                            <Button
                                intent="secondary"
                                fillStyle="ghost"
                                trailingIcon="chevron_right"
                            >
                                {productRecommendationRules.excluded.length > 0
                                    ? 'Manage'
                                    : 'Set Up'}
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </AiAgentLayout>
    )
}
