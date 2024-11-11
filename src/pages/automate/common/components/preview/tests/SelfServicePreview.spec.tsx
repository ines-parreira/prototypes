import {QueryClientProvider} from '@tanstack/react-query'
import {render, screen} from '@testing-library/react'
import React from 'react'

import {MemoryRouter} from 'react-router-dom'

import {TicketChannel} from 'business/types/ticket'
import SelfServicePreviewContext from 'pages/automate/common/components/preview/SelfServicePreviewContext'
import history from 'pages/history'
import {getSingleHelpCenterResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import SelfServicePreview from '../SelfServicePreview'

const queryClient = mockQueryClient()
describe('<SelfServicePreview />', () => {
    it('should render helpcenter preview', () => {
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
                        <SelfServicePreview
                            history={history}
                            channel={{
                                type: TicketChannel.HelpCenter,
                                value: getSingleHelpCenterResponseFixture,
                            }}
                        />
                    </SelfServicePreviewContext.Provider>
                </MemoryRouter>
            </QueryClientProvider>
        )
        expect(screen.getByText(/Categorie/)).toBeInTheDocument()
    })
})
