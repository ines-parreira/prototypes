import { useParams } from 'react-router-dom'

import { AiAgentLayout } from '../components/AiAgentLayout/AiAgentLayout'
import { PRODUCT_RECOMMENDATIONS } from '../constants'

import css from './AiAgentProductRecommendationsExclude.less'

export const AiAgentProductRecommendationsExclude = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()

    return (
        <AiAgentLayout
            shopName={shopName}
            title={PRODUCT_RECOMMENDATIONS}
            className={css.container}
        >
            <div className={css.card}>
                <div className={css.title}>Exclude products</div>
                <div className={css.text}>
                    Choose products to exclude from recommendations.
                </div>
                <div className={css.text}>0 products</div>
            </div>

            <div className={css.card}>
                <div className={css.title}>Exclude tags</div>
                <div className={css.text}>
                    Choose tags to exclude from recommendations.
                </div>
                <div className={css.text}>0 tags</div>
            </div>
        </AiAgentLayout>
    )
}
