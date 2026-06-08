import React from 'react'

import { useFlag } from '@repo/feature-flags'
import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { List, Map } from 'immutable'
import { MemoryRouter } from 'react-router-dom'

import { GorgiasChatCreationWizardStatus } from 'models/integration/types'
import { useChatRedesignOptIn } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useChatRedesignOptIn'
import { useSetChatRedesignOptIn } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useSetChatRedesignOptIn'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import { ActionsCell } from './ActionsCell'

const mockPush = jest.fn()
const mockSetOptIn = jest.fn(() => Promise.resolve())

jest.mock('@repo/feature-flags')
jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(() => () => 'https://example.com/oauth/{shop_name}'),
}))
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockPush }),
}))
jest.mock('pages/integrations/common/components/ForwardIcon', () => ({
    __esModule: true,
    default: ({ href, onClick }: { href: string; onClick: () => void }) => (
        <a data-testid="forward-icon" href={href} onClick={onClick}>
            Forward
        </a>
    ),
}))
jest.mock('pages/integrations/integration/hooks/useStoreIntegration')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp',
)
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useChatRedesignOptIn',
)
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useSetChatRedesignOptIn',
)

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>
const mockUseStoreIntegration = useStoreIntegration as jest.MockedFunction<
    typeof useStoreIntegration
>
const mockUseShouldShowChatSettingsRevamp =
    useShouldShowChatSettingsRevamp as jest.MockedFunction<
        typeof useShouldShowChatSettingsRevamp
    >
const mockUseChatRedesignOptIn = useChatRedesignOptIn as jest.MockedFunction<
    typeof useChatRedesignOptIn
>
const mockUseSetChatRedesignOptIn =
    useSetChatRedesignOptIn as jest.MockedFunction<
        typeof useSetChatRedesignOptIn
    >

const renderActionsCell = (
    chat: Map<any, any>,
    storeIntegration: Map<any, any>,
) =>
    render(
        <MemoryRouter>
            <ActionsCell chat={chat} storeIntegration={storeIntegration} />
        </MemoryRouter>,
    )

describe('ActionsCell', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
        mockUseStoreIntegration.mockReturnValue({
            storeIntegration: undefined,
            isConnected: false,
            isConnectedToShopify: false,
        })
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowNonAiAgentChatSettingsRevamp: false,
        } as ReturnType<typeof useShouldShowChatSettingsRevamp>)
        mockUseChatRedesignOptIn.mockReturnValue({
            isOptedIn: false,
            optInDatetime: undefined,
        })
        mockUseSetChatRedesignOptIn.mockReturnValue({
            setOptIn: mockSetOptIn,
            isSubmitting: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render "Finish setup" link for draft status', () => {
        const chat = Map({
            id: 123,
            meta: Map({
                wizard: Map({
                    status: GorgiasChatCreationWizardStatus.Draft,
                }),
                shop_integration_id: 456,
                shopify_integration_ids: List([456]),
            }),
        })

        renderActionsCell(chat, Map({}))

        expect(screen.getByText('Finish setup')).toBeInTheDocument()
    })

    it('should render ForwardIcon for completed status', () => {
        const chat = Map({
            id: 123,
            meta: Map({
                wizard: Map({
                    status: GorgiasChatCreationWizardStatus.Published,
                }),
                shop_integration_id: 456,
                shopify_integration_ids: List([456]),
            }),
        })

        renderActionsCell(chat, Map({}))

        expect(screen.getByTestId('forward-icon')).toBeInTheDocument()
    })

    it('should render "Update permissions" when feature flag is enabled and scope update needed', () => {
        mockUseFlag.mockReturnValue(true)

        const chat = Map({
            id: 123,
            meta: Map({
                wizard: Map({
                    status: GorgiasChatCreationWizardStatus.Published,
                }),
                shop_integration_id: 456,
                shopify_integration_ids: List([456]),
            }),
        })
        const storeIntegration = Map({
            meta: Map({
                need_scope_update: true,
                shop_name: 'test-shop',
            }),
        })

        renderActionsCell(chat, storeIntegration)

        expect(screen.getByText('Update permissions')).toBeInTheDocument()
    })

    it('should not render "Update permissions" when feature flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)

        const chat = Map({
            id: 123,
            meta: Map({
                wizard: Map({
                    status: GorgiasChatCreationWizardStatus.Published,
                }),
                shop_integration_id: 456,
                shopify_integration_ids: List([456]),
            }),
        })
        const storeIntegration = Map({
            meta: Map({
                need_scope_update: true,
                shop_name: 'test-shop',
            }),
        })

        renderActionsCell(chat, storeIntegration)

        expect(screen.queryByText('Update permissions')).not.toBeInTheDocument()
        expect(screen.getByTestId('forward-icon')).toBeInTheDocument()
    })

    describe('"Update to new chat" action', () => {
        const buildChat = () =>
            Map({
                id: 123,
                type: 'gorgias_chat',
                meta: Map({
                    wizard: Map({
                        status: GorgiasChatCreationWizardStatus.Published,
                    }),
                    shop_integration_id: 456,
                    shopify_integration_ids: List([456]),
                }),
            })

        it('renders when the revamp is enabled and the chat is not opted in', () => {
            mockUseShouldShowChatSettingsRevamp.mockReturnValue({
                shouldShowNonAiAgentChatSettingsRevamp: true,
            } as ReturnType<typeof useShouldShowChatSettingsRevamp>)

            renderActionsCell(buildChat(), Map({}))

            expect(screen.getByText('Update to new chat')).toBeInTheDocument()
        })

        it('does not render when the chat is already opted in', () => {
            mockUseShouldShowChatSettingsRevamp.mockReturnValue({
                shouldShowNonAiAgentChatSettingsRevamp: true,
            } as ReturnType<typeof useShouldShowChatSettingsRevamp>)
            mockUseChatRedesignOptIn.mockReturnValue({
                isOptedIn: true,
                optInDatetime: '2026-05-26T00:00:00Z',
            })

            renderActionsCell(buildChat(), Map({}))

            expect(
                screen.queryByText('Update to new chat'),
            ).not.toBeInTheDocument()
            expect(screen.getByTestId('forward-icon')).toBeInTheDocument()
        })

        it('does not render when the revamp is disabled', () => {
            renderActionsCell(buildChat(), Map({}))

            expect(
                screen.queryByText('Update to new chat'),
            ).not.toBeInTheDocument()
        })

        it('takes precedence over "Update permissions"', () => {
            mockUseFlag.mockReturnValue(true)
            mockUseShouldShowChatSettingsRevamp.mockReturnValue({
                shouldShowNonAiAgentChatSettingsRevamp: true,
            } as ReturnType<typeof useShouldShowChatSettingsRevamp>)

            const storeIntegration = Map({
                meta: Map({
                    need_scope_update: true,
                    shop_name: 'test-shop',
                }),
            })

            renderActionsCell(buildChat(), storeIntegration)

            expect(screen.getByText('Update to new chat')).toBeInTheDocument()
            expect(
                screen.queryByText('Update permissions'),
            ).not.toBeInTheDocument()
        })

        it('opens a confirmation modal before switching, without opting in yet', async () => {
            mockUseShouldShowChatSettingsRevamp.mockReturnValue({
                shouldShowNonAiAgentChatSettingsRevamp: true,
            } as ReturnType<typeof useShouldShowChatSettingsRevamp>)

            renderActionsCell(buildChat(), Map({}))

            await userEvent.click(screen.getByText('Update to new chat'))

            expect(screen.getByText('Switch to new chat')).toBeInTheDocument()
            expect(mockSetOptIn).not.toHaveBeenCalled()
            expect(mockPush).not.toHaveBeenCalled()
        })

        it('does not opt in or redirect when the confirmation is cancelled', async () => {
            mockUseShouldShowChatSettingsRevamp.mockReturnValue({
                shouldShowNonAiAgentChatSettingsRevamp: true,
            } as ReturnType<typeof useShouldShowChatSettingsRevamp>)

            renderActionsCell(buildChat(), Map({}))

            await userEvent.click(screen.getByText('Update to new chat'))
            await userEvent.click(
                screen.getByRole('button', { name: 'Cancel' }),
            )

            expect(mockSetOptIn).not.toHaveBeenCalled()
            expect(mockPush).not.toHaveBeenCalled()
        })

        it('opts in and redirects to the Appearance tab when confirmed', async () => {
            mockUseShouldShowChatSettingsRevamp.mockReturnValue({
                shouldShowNonAiAgentChatSettingsRevamp: true,
            } as ReturnType<typeof useShouldShowChatSettingsRevamp>)

            renderActionsCell(buildChat(), Map({}))

            await userEvent.click(screen.getByText('Update to new chat'))
            await userEvent.click(
                screen.getByRole('button', { name: 'Switch' }),
            )

            expect(mockSetOptIn).toHaveBeenCalledWith(true)

            await waitFor(() =>
                expect(mockPush).toHaveBeenCalledWith(
                    '/app/settings/channels/gorgias_chat/123/appearance',
                ),
            )
        })

        it('shows an error and keeps the modal open when opting in fails', async () => {
            mockUseShouldShowChatSettingsRevamp.mockReturnValue({
                shouldShowNonAiAgentChatSettingsRevamp: true,
            } as ReturnType<typeof useShouldShowChatSettingsRevamp>)
            mockSetOptIn.mockRejectedValueOnce(new Error('network error'))

            renderActionsCell(buildChat(), Map({}))

            await userEvent.click(screen.getByText('Update to new chat'))
            await userEvent.click(
                screen.getByRole('button', { name: 'Switch' }),
            )

            expect(
                await screen.findByText(
                    "Couldn't switch to the new chat. Please try again.",
                ),
            ).toBeInTheDocument()
            expect(mockPush).not.toHaveBeenCalled()
            expect(screen.getByText('Switch to new chat')).toBeInTheDocument()
        })
    })
})
