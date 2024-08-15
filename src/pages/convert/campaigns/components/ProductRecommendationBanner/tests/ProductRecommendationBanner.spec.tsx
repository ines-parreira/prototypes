import {render} from '@testing-library/react'
import React from 'react'
import {ProductRecommendationBanner} from '../ProductRecommendationBanner'

describe('ProductRecommendationBanner', () => {
    it('should render', () => {
        const {getByText} = render(<ProductRecommendationBanner />)

        expect(
            getByText(
                'Product recommendations will be personalized for each visitor, the product selection in the campaign preview is an example.'
            )
        ).toBeInTheDocument()
    })
})
