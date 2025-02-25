import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import SelfServicePreviewContext from 'pages/automate/common/components/preview/SelfServicePreviewContext'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import SelfServiceHelpCenterRequestSentPage from '../SelfServiceHelpCenterRequestSentPage'

const queryClient = mockQueryClient()
describe('<SelfServiceHelpCenterRequestSentPage />', () => {
    it('should render component', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <SelfServicePreviewContext.Provider
                        value={{
                            reportOrderIssueReason: {
                                reasonKey: 'reasonKey',
                                action: {
                                    responseMessageContent: {
                                        html: 'html',
                                        text: 'text',
                                    },
                                    type: 'automated_response',
                                    showHelpfulPrompt: true,
                                },
                            },
                        }}
                    >
                        <SelfServiceHelpCenterRequestSentPage
                            helpCenter={getSingleHelpCenterResponseFixture}
                        />
                    </SelfServicePreviewContext.Provider>
                </MemoryRouter>
            </QueryClientProvider>,
        )
        expect(screen.getByText('Issue reported')).toBeInTheDocument()
    })
})
