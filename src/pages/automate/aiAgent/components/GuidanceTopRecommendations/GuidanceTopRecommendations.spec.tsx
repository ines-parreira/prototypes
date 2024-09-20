import React from 'react'
import {render, screen} from '@testing-library/react'

import {GuidanceTopRecommendations} from './GuidanceTopRecommendations'

describe('<GuidanceTopRecommendations />', () => {
    it('should display content', () => {
        const props = {
            aiGuidances: [
                {
                    key: '',
                    name: '',
                    content: '',
                    review_action: 'created' as const,
                },
            ],
            isLoading: false,
            shopName: 'Flower shop',
        }

        render(<GuidanceTopRecommendations {...props} />)

        expect(
            screen.getByText('Top recommendations based on your tickets')
        ).toBeInTheDocument()
    })
})
