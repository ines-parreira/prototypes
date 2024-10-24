import {QueryClientProvider} from '@tanstack/react-query'
import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import {MemoryRouter, Route} from 'react-router-dom'

import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {mockStore} from 'utils/testing'

import {SELF_SERVICE_PREVIEW_ROUTES} from '../constants'
import SelfServiceChatIntegrationPreview from '../SelfServiceChatIntegrationPreview'
import {useSelfServicePreviewContext} from '../SelfServicePreviewContext'

jest.mock('../SelfServicePreviewContext', () => ({
    useSelfServicePreviewContext: jest.fn(),
}))

const mockIntegration = {
    name: 'Test Integration',
    decoration: {
        avatar: {
            company_logo_url: 'https://example.com/logo.png',
            image_type: GorgiasChatAvatarImageType.AGENT_PICTURE,
            name_type: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
        },
        introduction_text: 'Welcome to our chat!',
        main_color: '#ff0000',
        main_font_family: 'Arial',
        header_picture_url: 'https://example.com/header.png',
        display_bot_label: true,
        use_main_color_outside_business_hours: true,
    },
    meta: {
        preferences: {
            auto_responder: {
                enabled: true,
                reply: 'Thank you for reaching out!',
            },
        },
    },
} as any
const queryClient = mockQueryClient()
describe('SelfServiceChatIntegrationPreview', () => {
    beforeEach(() => {
        ;(useSelfServicePreviewContext as jest.Mock).mockReturnValue({
            reportOrderIssueReason: {action: {showHelpfulPrompt: true}},
        })
    })

    it('renders correctly with default props', () => {
        render(
            <Provider store={mockStore({})}>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <SelfServiceChatIntegrationPreview
                            integration={mockIntegration}
                        />
                    </MemoryRouter>
                </QueryClientProvider>
            </Provider>
        )
        expect(screen.getByText('Welcome to our chat!')).toBeInTheDocument()
    })

    it('renders the correct page based on route', () => {
        render(
            <Provider store={mockStore({})}>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter
                        initialEntries={[SELF_SERVICE_PREVIEW_ROUTES.ORDERS]}
                    >
                        <Route path={SELF_SERVICE_PREVIEW_ROUTES.ORDERS}>
                            <SelfServiceChatIntegrationPreview
                                integration={mockIntegration}
                            />
                        </Route>
                    </MemoryRouter>
                </QueryClientProvider>
            </Provider>
        )

        expect(screen.getByText('Your orders')).toBeInTheDocument()
    })

    it('renders the footer correctly based on path', () => {
        render(
            <Provider store={mockStore({})}>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter
                        initialEntries={[SELF_SERVICE_PREVIEW_ROUTES.CANCEL]}
                    >
                        <SelfServiceChatIntegrationPreview
                            integration={mockIntegration}
                        />
                    </MemoryRouter>
                </QueryClientProvider>
            </Provider>
        )

        expect(
            screen.getByText(`I'd like to cancel the following fulfillment:`)
        ).toBeInTheDocument()
    })

    it('updates correctly on prop changes', () => {
        const {rerender} = render(
            <Provider store={mockStore({})}>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <SelfServiceChatIntegrationPreview
                            integration={mockIntegration}
                        />
                    </MemoryRouter>
                </QueryClientProvider>
            </Provider>
        )

        const updatedIntegration = {
            ...mockIntegration,
            name: 'Updated Integration',
            decoration: {
                introduction_text: 'Updated introduction text',
            },
        }

        rerender(
            <Provider store={mockStore({})}>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <SelfServiceChatIntegrationPreview
                            integration={updatedIntegration}
                        />
                    </MemoryRouter>
                </QueryClientProvider>
            </Provider>
        )

        expect(
            screen.getByText('Updated introduction text')
        ).toBeInTheDocument()
    })
})
