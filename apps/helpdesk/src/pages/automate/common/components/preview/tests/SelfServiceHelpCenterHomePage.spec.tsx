import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

import SelfServicePreviewContext from 'pages/automate/common/components/preview/SelfServicePreviewContext'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import SelfServiceHelpCenterHomePage from '../SelfServiceHelpCenterHomePage'

const queryClient = mockQueryClient()
describe('<SelfServiceHelpCenterHomePage />', () => {
    it('should render component', () => {
        render(
            <QueryClientProvider client={queryClient}>
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
                    <SelfServiceHelpCenterHomePage
                        helpCenter={getSingleHelpCenterResponseFixture}
                    />
                </SelfServicePreviewContext.Provider>
            </QueryClientProvider>,
        )
        expect(screen.getByText('Categories')).toBeInTheDocument()
    })
})
