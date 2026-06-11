import React from 'react'

import { render } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { RecommendationFilter as RecommendationFilters } from '../RecommendationFilters'

const queryClient = mockQueryClient()
describe('<RecommendationFilters />', () => {
    it('should render component', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <RecommendationFilters
                    articleId={1}
                    feedbackOptions={[]}
                    helpCenterId={1}
                    onHandleArticleChange={jest.fn()}
                    onHandleFeedbackOptionChange={jest.fn()}
                    onHandleShowCompletedChange={jest.fn()}
                    showCompleted={false}
                />
            </QueryClientProvider>,
        )
        expect(screen.getByText('Show completed')).toBeInTheDocument()
    })
})
