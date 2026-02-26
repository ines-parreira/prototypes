import { history } from '@repo/routing'
import { assumeMock } from '@repo/testing'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { getIntegrationConfig } from 'state/integrations/helpers'

import { IntegrationType } from '../../../../../../../../models/integration/types'
import GorgiasChatIntegrationList from './GorgiasChatIntegrationList'

jest.mock('@repo/routing', () => ({
    history: {
        push: jest.fn(),
    },
}))

jest.mock('state/integrations/helpers', () => ({
    getIntegrationConfig: jest.fn(),
}))

jest.mock('pages/common/components/Loader/Loader', () => {
    return function MockLoader() {
        return <div data-testid="loader">Loading...</div>
    }
})

const MockChatIntegrationsTable = jest.fn(
    ({ chats, integrations, loading }) => (
        <div data-testid="chat-integrations-table">
            <div data-testid="chats-count">{chats.size}</div>
            <div data-testid="integrations-count">{integrations.size}</div>
            <div data-testid="loading-state">
                {loading.get('integrations') ? 'Loading' : 'Not loading'}
            </div>
        </div>
    ),
)

jest.mock('./ChatIntegrationsTable', () => ({
    ChatIntegrationsTable: (props: any) => MockChatIntegrationsTable(props),
}))

const historyPushMock = assumeMock(history.push)
const getIntegrationConfigMock = assumeMock(getIntegrationConfig)

const renderComponent = ({
    integrations = fromJS([]),
    loading = fromJS({}),
}: {
    integrations?: any
    loading?: any
}) => {
    return render(
        <GorgiasChatIntegrationList
            integrations={integrations}
            loading={loading}
        />,
    )
}

describe('GorgiasChatIntegrationList', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        getIntegrationConfigMock.mockReturnValue({
            title: 'Chat',
            type: IntegrationType.GorgiasChat,
            description: '',
            longDescription: '',
            benefits: [],
            company: {
                name: '',
                url: '',
            },
            categories: [],
            screenshots: [],
            privacyPolicy: '',
            setupGuide: '',
            pricingPlan: null,
        })
    })

    describe('Page Header', () => {
        it('navigates to create wizard when "New chat" button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent({})

            const newChatButton = screen.getByRole('button', {
                name: /new chat/i,
            })

            await act(() => user.click(newChatButton))

            expect(historyPushMock).toHaveBeenCalledWith(
                '/app/settings/channels/gorgias_chat/new/create-wizard',
            )
        })

        it('uses integration config title for page header', () => {
            getIntegrationConfigMock.mockReturnValue({
                title: 'Custom Chat Title',
                type: IntegrationType.GorgiasChat,
                description: '',
                longDescription: '',
                benefits: [],
                company: {
                    name: '',
                    url: '',
                },
                categories: [],
                screenshots: [],
                privacyPolicy: '',
                setupGuide: '',
                pricingPlan: null,
            })

            renderComponent({})

            expect(screen.queryByText(/Custom Chat Title/i)).toBeInTheDocument()
        })

        it('calls getIntegrationConfig with correct integration type', () => {
            renderComponent({})

            expect(getIntegrationConfigMock).toHaveBeenCalledWith(
                IntegrationType.GorgiasChat,
            )
        })
    })

    describe('Empty State', () => {
        it('renders empty state when no chat integrations exist', () => {
            renderComponent({
                integrations: fromJS([]),
            })

            expect(
                screen.getByText(/chat with your customers/i),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /you have no integration of this type at the moment/i,
                ),
            ).toBeInTheDocument()
        })

        it('shows loader when integrations are loading', () => {
            renderComponent({
                integrations: fromJS([]),
                loading: fromJS({ integrations: true }),
            })

            expect(screen.getByTestId('loader')).toBeInTheDocument()
        })

        it('does not render ChatIntegrationsTable when no chat integrations exist', () => {
            renderComponent({
                integrations: fromJS([]),
            })

            expect(
                screen.queryByTestId('chat-integrations-table'),
            ).not.toBeInTheDocument()
        })
    })

    describe('With Chat Integrations', () => {
        const mockChatIntegrations = fromJS([
            {
                id: 1,
                type: IntegrationType.GorgiasChat,
                name: 'Website Chat',
                meta: {},
            },
            {
                id: 2,
                type: IntegrationType.GorgiasChat,
                name: 'Support Chat',
                meta: {},
            },
        ])

        it('renders ChatIntegrationsTable when chat integrations exist', () => {
            renderComponent({
                integrations: mockChatIntegrations,
            })

            expect(
                screen.getByTestId('chat-integrations-table'),
            ).toBeInTheDocument()
        })

        it('passes only chat integrations to ChatIntegrationsTable', () => {
            const mixedIntegrations = fromJS([
                {
                    id: 1,
                    type: IntegrationType.GorgiasChat,
                    name: 'Website Chat',
                },
                {
                    id: 2,
                    type: IntegrationType.Email,
                    name: 'Email Integration',
                },
                {
                    id: 3,
                    type: IntegrationType.GorgiasChat,
                    name: 'Support Chat',
                },
            ])

            renderComponent({
                integrations: mixedIntegrations,
                loading: fromJS({ integrations: true }),
            })

            expect(MockChatIntegrationsTable).toHaveBeenCalledWith({
                chats: fromJS([
                    {
                        id: 1,
                        type: IntegrationType.GorgiasChat,
                        name: 'Website Chat',
                    },
                    {
                        id: 3,
                        type: IntegrationType.GorgiasChat,
                        name: 'Support Chat',
                    },
                ]),
                integrations: mixedIntegrations,
                loading: fromJS({ integrations: true }),
            })
        })

        it('does not render empty state when chat integrations exist', () => {
            renderComponent({
                integrations: mockChatIntegrations,
            })

            expect(
                screen.queryByText(/chat with your customers/i),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText(
                    /you have no integration of this type at the moment/i,
                ),
            ).not.toBeInTheDocument()
        })

        it('handles empty integrations list', () => {
            renderComponent({
                integrations: fromJS([]),
            })

            expect(
                screen.getByText(
                    /you have no integration of this type at the moment/i,
                ),
            ).toBeInTheDocument()
        })

        it('handles integrations with null or undefined type', () => {
            const integrationsWithNull = fromJS([
                {
                    id: 1,
                    type: IntegrationType.GorgiasChat,
                    name: 'Chat 1',
                },
                {
                    id: 2,
                    type: null,
                    name: 'Invalid',
                },
                {
                    id: 3,
                    name: 'No Type',
                },
            ])

            renderComponent({
                integrations: integrationsWithNull,
                loading: fromJS({ integrations: true }),
            })

            expect(MockChatIntegrationsTable).toHaveBeenCalledWith({
                chats: fromJS([
                    {
                        id: 1,
                        type: IntegrationType.GorgiasChat,
                        name: 'Chat 1',
                    },
                ]),
                integrations: integrationsWithNull,
                loading: fromJS({ integrations: true }),
            })
        })
    })
})
