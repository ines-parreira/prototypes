import {QueryClientProvider} from '@tanstack/react-query'
import {render, screen} from '@testing-library/react'
import React from 'react'

import {MemoryRouter} from 'react-router-dom'

import SelfServicePreviewContext from 'pages/automate/common/components/preview/SelfServicePreviewContext'
import {getSingleHelpCenterResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import SelfServiceHelpCenterReturnPortalPage from '../SelfServiceHelpCenterReturnPortalPage'

const queryClient = mockQueryClient()
describe('<SelfServiceHelpCenterReturnPortalPage />', () => {
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
                        <SelfServiceHelpCenterReturnPortalPage
                            helpCenter={getSingleHelpCenterResponseFixture}
                        />
                    </SelfServicePreviewContext.Provider>
                </MemoryRouter>
            </QueryClientProvider>
        )
        expect(
            screen.getByText('Complete your return in our return portal')
        ).toBeInTheDocument()
    })
})
