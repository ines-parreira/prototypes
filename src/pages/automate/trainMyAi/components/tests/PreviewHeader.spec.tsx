import React from 'react'
import {screen, render} from '@testing-library/react'
import {QueryClientProvider} from '@tanstack/react-query'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import PreviewHeader from '../PreviewHeader'

const queryClient = mockQueryClient()

describe('<PreviewHeader />', () => {
    it('should render component', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <PreviewHeader
                    isFeedbackProvided
                    noRelevantArticles
                    onChange={jest.fn()}
                    onSelectArticle={jest.fn()}
                    recommendations={{
                        accountId: 1,
                        articleId: 1,
                        articleIdFeedback: 1,
                        conversationId: '1',
                        createdDatetime: '',
                        helpCenterId: 1,
                        id: 1,
                        isHelpful: true,
                        locale: 'en-US',
                        message: 'message',
                        updatedDatetime: '',
                    }}
                />
            </QueryClientProvider>
        )

        expect(screen.getByText(/thanks for the feedback/i)).toBeInTheDocument()
    })
})
