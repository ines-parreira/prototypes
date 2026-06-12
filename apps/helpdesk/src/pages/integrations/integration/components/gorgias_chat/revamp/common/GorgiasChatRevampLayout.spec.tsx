import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { IntegrationType } from 'models/integration/types'
import { useChatRedesignOptIn } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useChatRedesignOptIn'
import { useSetChatRedesignOptIn } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useSetChatRedesignOptIn'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import { GorgiasChatRevampLayout } from './GorgiasChatRevampLayout'

let mockIsPreviewingNewChat = false

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useChatRedesignOptIn',
)
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useSetChatRedesignOptIn',
)
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp',
)
jest.mock('pages/integrations/integration/hooks/useStoreIntegration')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
    () => ({
        useChatPreviewPanelContext: () => ({
            isPreviewingNewChat: mockIsPreviewingNewChat,
        }),
    }),
)
jest.mock('./GorgiasChatRevampNavigation', () => ({
    GorgiasChatRevampNavigation: () => null,
}))
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatRedesignOptInBanner/ChatRedesignOptInBanner',
    () => ({
        ChatRedesignOptInBanner: () => null,
    }),
)

const mockLogOptOutClicked = jest.fn()
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useLogMigrationEvent',
    () => ({
        useLogMigrationEvent: () => ({
            logOptOutClicked: mockLogOptOutClicked,
        }),
    }),
)

const mockUseChatRedesignOptIn = useChatRedesignOptIn as jest.MockedFunction<
    typeof useChatRedesignOptIn
>
const mockUseSetChatRedesignOptIn =
    useSetChatRedesignOptIn as jest.MockedFunction<
        typeof useSetChatRedesignOptIn
    >
const mockUseShouldShowChatSettingsRevamp =
    useShouldShowChatSettingsRevamp as jest.MockedFunction<
        typeof useShouldShowChatSettingsRevamp
    >
const mockUseStoreIntegration = useStoreIntegration as jest.MockedFunction<
    typeof useStoreIntegration
>

const mockSetOptIn = jest.fn().mockResolvedValue(undefined)

const integration = fromJS({
    id: 42,
    type: IntegrationType.GorgiasChat,
    name: 'Glossier',
    meta: {},
})

const defaultShouldShowFlags = {
    isChatSettingsRevampEnabled: false,
    isChatSettingsScreensRevampFlowsEnabled: false,
    isChatSettingsScreensRevampOrderManagementEnabled: false,
    isNonAiAgentChat2RevampEnabled: true,
    shouldEnforceChatRedesignWithoutAiAgent: false,
    shouldShowChatSettingsRevamp: false,
    shouldShowNonAiAgentChatSettingsRevamp: true,
    shouldShowLegacyChatCustomization: true,
    shouldShowFlowsScreensRevamp: false,
    shouldShowOrderManagementScreensRevamp: false,
    shouldShowNonAiAgentRevamp: false,
    isLoading: false,
}

const renderLayout = (onSave = jest.fn()) =>
    render(
        <GorgiasChatRevampLayout integration={integration} onSave={onSave}>
            <div>Tab content</div>
        </GorgiasChatRevampLayout>,
    )

beforeEach(() => {
    jest.clearAllMocks()
    mockIsPreviewingNewChat = false
    mockUseStoreIntegration.mockReturnValue({
        storeIntegration: undefined,
        isConnected: false,
        isConnectedToShopify: false,
    })
    mockUseShouldShowChatSettingsRevamp.mockReturnValue(defaultShouldShowFlags)
    mockUseChatRedesignOptIn.mockReturnValue({
        isOptedIn: false,
        optInDatetime: undefined,
    })
    mockUseSetChatRedesignOptIn.mockReturnValue({
        setOptIn: mockSetOptIn,
        isSubmitting: false,
    })
})

describe('<GorgiasChatRevampLayout />', () => {
    it('shows Save and no Switch to old chat by default', () => {
        renderLayout()

        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: 'Switch to old chat' }),
        ).not.toBeInTheDocument()
    })

    it('hides Save while previewing the new chat', () => {
        mockIsPreviewingNewChat = true

        renderLayout()

        expect(
            screen.queryByRole('button', { name: 'Save' }),
        ).not.toBeInTheDocument()
    })

    it('hides Switch to old chat once the chat redesign is enforced without an AI agent', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            ...defaultShouldShowFlags,
            shouldEnforceChatRedesignWithoutAiAgent: true,
        })
        mockUseChatRedesignOptIn.mockReturnValue({
            isOptedIn: true,
            optInDatetime: '2026-05-01T00:00:00Z',
        })

        renderLayout()

        expect(
            screen.queryByRole('button', { name: 'Switch to old chat' }),
        ).not.toBeInTheDocument()
    })

    it('confirms before reverting when Switch to old chat is clicked', async () => {
        mockUseChatRedesignOptIn.mockReturnValue({
            isOptedIn: true,
            optInDatetime: '2026-05-01T00:00:00Z',
        })
        const user = userEvent.setup()

        renderLayout()

        await user.click(
            screen.getByRole('button', { name: 'Switch to old chat' }),
        )

        // Confirmation modal appears; nothing persisted yet.
        expect(
            screen.getByText('Switch back to the old chat?'),
        ).toBeInTheDocument()
        expect(mockSetOptIn).not.toHaveBeenCalled()

        await user.click(screen.getByRole('button', { name: 'Switch' }))

        await waitFor(() => expect(mockSetOptIn).toHaveBeenCalledWith(false))
        await waitFor(() =>
            expect(mockLogOptOutClicked).toHaveBeenCalledWith({
                timeSinceOptInSeconds: expect.any(Number),
            }),
        )
    })
})
