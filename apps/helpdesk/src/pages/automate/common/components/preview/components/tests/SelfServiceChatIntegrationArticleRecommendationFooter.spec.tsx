import React from 'react'

import { render, screen } from '@testing-library/react'

import SelfServiceChatIntegrationArticleRecommendationFooter from '../SelfServiceChatIntegrationArticleRecommendationFooter'

describe('<SelfServiceChatIntegrationArticleRecommendationFooter />', () => {
    it('should render component', () => {
        render(
            <SelfServiceChatIntegrationArticleRecommendationFooter
                sspTexts={{
                    foo: 'bar',
                }}
            />,
        )

        expect(screen.getByRole('img')).toBeInTheDocument()
    })
})
