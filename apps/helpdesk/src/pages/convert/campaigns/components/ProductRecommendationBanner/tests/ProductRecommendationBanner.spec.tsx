import React from 'react'

import { render } from '@testing-library/react'

import { ProductRecommendationScenario } from 'pages/convert/campaigns/types/CampaignAttachment'

import { ProductRecommendationBanner } from '../ProductRecommendationBanner'

describe('ProductRecommendationBanner', () => {
    it('should render', () => {
        const { getByText } = render(
            <ProductRecommendationBanner
                scenario={ProductRecommendationScenario.SimilarSeen}
            />,
        )

        expect(
            getByText(
                'Product recommendations will be personalized for each product page, the product selection in the campaign preview is an example.',
            ),
        ).toBeInTheDocument()
    })

    it('should render different text for newest scenario', () => {
        const { getByText } = render(
            <ProductRecommendationBanner
                scenario={ProductRecommendationScenario.Newest}
            />,
        )

        expect(
            getByText(
                'Product recommendations will be updated depending on your product catalog, campaign preview is an example.',
            ),
        ).toBeInTheDocument()
    })
})
