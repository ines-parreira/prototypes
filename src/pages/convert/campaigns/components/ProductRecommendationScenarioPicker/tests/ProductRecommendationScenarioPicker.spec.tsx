import {fireEvent, render} from '@testing-library/react'
import React from 'react'
import {ProductRecommendationScenario} from 'pages/convert/campaigns/types/CampaignAttachment'
import {AttachmentEnum} from 'common/types'
import ProductRecommendationScenarioPicker from '../ProductRecommendationScenarioPicker'

describe('ProductRecommendationScenarioPicker', () => {
    it('should render the component', () => {
        const {getByText} = render(
            <ProductRecommendationScenarioPicker
                products={[]}
                onClick={jest.fn()}
            />
        )

        expect(getByText('Similar Products You Have Seen')).toBeInTheDocument()
    })

    it('should call onClick with the correct attachment', () => {
        const onClick = jest.fn()
        const {getByText} = render(
            <ProductRecommendationScenarioPicker
                products={[]}
                onClick={onClick}
            />
        )

        const seenScenario = getByText('Similar Products You Have Seen')
        fireEvent.click(seenScenario)

        expect(onClick).toHaveBeenCalledWith({
            content_type: AttachmentEnum.ProductRecommendation,
            name: 'Similar Products You Have Seen',
            extra: {
                id: expect.any(String),
                scenario: ProductRecommendationScenario.SimilarSeen,
                description:
                    'Recommends based on visitors’ product pages browsed',
            },
        })
    })
})
