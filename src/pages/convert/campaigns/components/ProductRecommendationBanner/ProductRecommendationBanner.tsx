import React from 'react'

import classNames from 'classnames'

import { ProductRecommendationScenario } from 'pages/convert/campaigns/types/CampaignAttachment'

import css from './ProductRecommendationBanner.less'

type Props = {
    scenario: ProductRecommendationScenario | null
    className?: string
}

const getTextByScenario = (scenario: ProductRecommendationScenario | null) => {
    switch (scenario) {
        case ProductRecommendationScenario.Newest:
            return 'Product recommendations will be updated depending on your product catalog, campaign preview is an example.'
        default:
            return 'Product recommendations will be personalized for each product page, the product selection in the campaign preview is an example.'
    }
}

export const ProductRecommendationBanner = ({ scenario, className }: Props) => {
    const text = getTextByScenario(scenario)

    return (
        <div className={classNames(css.bannerWrapper, className)}>
            <div className={css.icon}>
                <i className="material-icons">auto_awesome</i>
            </div>
            <div>{text}</div>
        </div>
    )
}
