import { UserRole } from '@repo/permissions'
import { assumeMock, render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import { fromJS, Map } from 'immutable'

import { TicketChannel } from 'business/types/ticket'
import { user } from 'fixtures/users'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { StoreIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import useSelfServiceChannels from 'pages/automate/common/hooks/useSelfServiceChannels'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import type { SelfServiceHelpCenterChannel } from 'pages/automate/common/hooks/useSelfServiceHelpCenterChannels'
import { useChatPreviewPanel } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'
import { useStoreSelector } from 'settings/automate'
import type { RootState } from 'state/types'

import { BASE_PATH, OrderManagementSettings } from '../OrderManagementSettings'

jest.mock('settings/automate', () => ({
    ...jest.requireActual('settings/automate'),
    useStoreSelector: jest.fn(),
}))

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp',
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
    () => ({
        ...jest.requireActual(
            'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
        ),
        useChatPreviewPanel: jest.fn(),
    }),
)

jest.mock(
    'pages/automate/orderManagement/OrderManagementViewContainer',
    () => ({
        __esModule: true,
        OrderManagementViewContainer: () => <div>OrderManagementView</div>,
    }),
)

jest.mock('pages/automate/common/hooks/useSelfServiceChannels')

jest.mock(
    'pages/automate/connectedChannels/revamp/components/ChannelSelector/ChannelSelector',
    () => ({
        ChannelSelector: ({ selectedChannel }: { selectedChannel: any }) => (
            <div aria-label="Channel selector">
                {selectedChannel?.value?.name}
            </div>
        ),
    }),
)

const useStoreSelectorMock = assumeMock(useStoreSelector)
const useAiAgentAccessMock = assumeMock(useAiAgentAccess)
const useSelfServiceChannelsMock = assumeMock(useSelfServiceChannels)
const mockUseShouldShowChatSettingsRevamp = assumeMock(
    useShouldShowChatSettingsRevamp,
)
const mockUseChatPreviewPanel = assumeMock(useChatPreviewPanel)

const buildChatPreviewPanelMock = (
    overrides: Partial<ReturnType<typeof useChatPreviewPanel>> = {},
): ReturnType<typeof useChatPreviewPanel> => ({
    chatPreviewPortal: null,
    showPreviewPanel: jest.fn(),
    hidePreviewPanel: jest.fn(),
    onChatPreviewLoaded: jest.fn(() => jest.fn()),
    openChat: jest.fn(),
    closeChat: jest.fn(),
    displayPage: jest.fn(),
    updateMainColor: jest.fn(),
    updatePosition: jest.fn(),
    updateHeaderPictureUrl: jest.fn(),
    updateHeaderAlternativePictureUrl: jest.fn(),
    updateLauncher: jest.fn(),
    updateTexts: jest.fn(),
    updateSSPTexts: jest.fn(),
    updateLegalDisclaimer: jest.fn(),
    updateLegalDisclaimerEnabled: jest.fn(),
    updateWorkflowEntryPoints: jest.fn(),
    updateOrderManagementFlows: jest.fn(),
    reloadPreview: jest.fn(),
    updateAvatarSettings: jest.fn(),
    updateQuickReplies: jest.fn(),
    updatePreviewOrders: jest.fn(),
    setConversationMessages: jest.fn(),
    ...overrides,
})

const initialState: Partial<RootState> = {
    currentAccount: Map({
        id: 12345,
    }),
    integrations: fromJS({
        integrations: [],
    }),
    billing: fromJS({
        products: [],
    }),
    currentUser: fromJS({
        ...user,
        role: {
            name: UserRole.Agent,
        },
    }),
    entities: {
        contactForm: {
            contactForms: {
                contactFormById: {},
            },
            contactFormsAutomationSettings: {
                automationSettingsByContactFormId: {},
            },
        },
        chatsApplicationAutomationSettings: {},
    } as unknown as RootState['entities'],
}

const integrations = [
    {
        id: 1,
        type: IntegrationType.Shopify,
        name: 'my-first-store',
        meta: { shop_name: 'my-first-store' },
    },
] as StoreIntegration[]

const integrationWithDifferentDisplayName = {
    id: 2,
    type: IntegrationType.Shopify,
    name: 'My Shop',
    meta: { shop_name: 'gorgiastest' },
} as StoreIntegration

describe('OrderManagementSettings', () => {
    let onChange: jest.Mock

    const renderSettings = (route = BASE_PATH) =>
        render(<OrderManagementSettings />, {
            initialEntries: [route],
            path: `${BASE_PATH}/:shopType?/:shopName?`,
            storeState: initialState,
        })

    beforeEach(() => {
        onChange = jest.fn()
        useStoreSelectorMock.mockReturnValue({
            integrations,
            onChange,
            selected: undefined,
        })
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        useSelfServiceChannelsMock.mockReturnValue([])
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevampWhenAiAgentEnabled: false,
            shouldShowFlowsScreensRevamp: false,
            shouldShowOrderManagementScreensRevamp: false,
            isLoading: false,
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampFlowsEnabled: false,
            isChatSettingsScreensRevampOrderManagementEnabled: false,
        })
        mockUseChatPreviewPanel.mockReturnValue(buildChatPreviewPanelMock())
    })

    describe('legacy header', () => {
        it('should render the header title', () => {
            renderSettings()
            expect(screen.getByText('Order Management')).toBeInTheDocument()
        })

        it('should not render navigation if no store is selected', () => {
            renderSettings()
            expect(screen.queryByText('Configuration')).not.toBeInTheDocument()
        })

        it('should render navigation once a store has been selected', () => {
            useStoreSelectorMock.mockReturnValue({
                integrations,
                onChange,
                selected: integrations[0],
            })

            renderSettings(`${BASE_PATH}/shopify/my-first-store`)
            expect(screen.getByText('Configuration')).toBeInTheDocument()
            expect(screen.getByText('Channels')).toBeInTheDocument()
        })

        it('should render breadcrumb with page name on a sub-page', () => {
            useStoreSelectorMock.mockReturnValue({
                integrations,
                onChange,
                selected: integrations[0],
            })

            renderSettings(`${BASE_PATH}/shopify/my-first-store/track`)
            expect(screen.getByText('Order management')).toBeInTheDocument()
            expect(screen.getByText('Track order')).toBeInTheDocument()
        })

        it('should render breadcrumb with scenario on a scenario sub-page', () => {
            useStoreSelectorMock.mockReturnValue({
                integrations,
                onChange,
                selected: integrations[0],
            })

            renderSettings(
                `${BASE_PATH}/shopify/my-first-store/report-issue/new`,
            )
            expect(screen.getByText('Report order issue')).toBeInTheDocument()
            expect(screen.getByText(/new/i)).toBeInTheDocument()
        })
    })

    describe('revamp header', () => {
        beforeEach(() => {
            mockUseShouldShowChatSettingsRevamp.mockReturnValue({
                shouldShowRevampWhenAiAgentEnabled: true,
                shouldShowFlowsScreensRevamp: false,
                shouldShowOrderManagementScreensRevamp: true,
                isLoading: false,
                isChatSettingsRevampEnabled: false,
                isChatSettingsScreensRevampFlowsEnabled: false,
                isChatSettingsScreensRevampOrderManagementEnabled: false,
            })
        })

        it('should render the header title', () => {
            renderSettings()
            expect(screen.getByText('Order Management')).toBeInTheDocument()
        })

        it('should not render navigation if no store is selected', () => {
            renderSettings()
            expect(screen.queryByText('Configuration')).not.toBeInTheDocument()
        })

        it('should render navigation once a store has been selected', () => {
            useStoreSelectorMock.mockReturnValue({
                integrations,
                onChange,
                selected: integrations[0],
            })

            renderSettings(`${BASE_PATH}/shopify/my-first-store`)
            expect(screen.getByText('Configuration')).toBeInTheDocument()
            expect(screen.getByText('Channels')).toBeInTheDocument()
        })

        it('should build navigation links from the store route name', () => {
            useStoreSelectorMock.mockReturnValue({
                integrations: [integrationWithDifferentDisplayName],
                onChange,
                selected: integrationWithDifferentDisplayName,
            })

            renderSettings(`${BASE_PATH}/shopify/gorgiastest`)

            const configurationLink = screen.getByRole('link', {
                name: 'Configuration',
            })
            expect(configurationLink).toHaveAttribute(
                'href',
                '/app/settings/order-management/shopify/gorgiastest',
            )
            expect(configurationLink).toHaveAttribute('aria-current', 'page')
        })
    })

    describe('chat preview SSP texts', () => {
        it('should seed SSP texts when the chat preview has loaded', () => {
            const updateSSPTexts = jest.fn()
            const onChatPreviewLoaded = jest.fn(
                (callback, fireIfAlreadyLoaded) => {
                    if (fireIfAlreadyLoaded) {
                        callback()
                    }
                    return jest.fn()
                },
            )
            mockUseChatPreviewPanel.mockReturnValue(
                buildChatPreviewPanelMock({
                    onChatPreviewLoaded,
                    updateSSPTexts,
                }),
            )

            act(() => {
                renderSettings()
            })

            expect(onChatPreviewLoaded).toHaveBeenCalledWith(
                expect.any(Function),
                true,
            )
            expect(updateSSPTexts).toHaveBeenCalledWith(expect.any(Object))
        })
    })

    describe('channel selection effects', () => {
        const chatChannel: SelfServiceChatChannel = {
            type: TicketChannel.Chat,
            value: {
                id: 1,
                name: 'Chat Channel',
                meta: { app_id: 'app-1' },
            } as any,
        }

        const helpCenterChannel: SelfServiceHelpCenterChannel = {
            type: TicketChannel.HelpCenter,
            value: { id: 2, name: 'Help Center' } as any,
        }

        beforeEach(() => {
            useStoreSelectorMock.mockReturnValue({
                integrations,
                onChange,
                selected: integrations[0],
            })
            mockUseChatPreviewPanel.mockImplementation((options) =>
                buildChatPreviewPanelMock({
                    chatPreviewPortal: options?.headerActions as ReturnType<
                        typeof useChatPreviewPanel
                    >['chatPreviewPortal'],
                }),
            )
        })

        it('should switch to the chat channel when on the channels route and a non-chat channel is initially selected', async () => {
            useSelfServiceChannelsMock.mockReturnValue([
                helpCenterChannel,
                chatChannel,
            ])

            renderSettings(`${BASE_PATH}/shopify/my-first-store/channels`)

            await waitFor(() => {
                expect(screen.getByText('Chat Channel')).toBeInTheDocument()
            })
        })

        it('should keep the chat channel selected when on the channels route and chat is already selected', () => {
            useSelfServiceChannelsMock.mockReturnValue([chatChannel])

            renderSettings(`${BASE_PATH}/shopify/my-first-store/channels`)

            expect(screen.getByText('Chat Channel')).toBeInTheDocument()
        })

        it('should not switch to the chat channel when not on the channels route', () => {
            useSelfServiceChannelsMock.mockReturnValue([
                helpCenterChannel,
                chatChannel,
            ])

            renderSettings(`${BASE_PATH}/shopify/my-first-store`)

            expect(screen.getByText('Help Center')).toBeInTheDocument()
        })

        it('should select the first channel when channel is initially undefined and channels become available', async () => {
            useSelfServiceChannelsMock
                .mockReturnValueOnce([])
                .mockReturnValue([helpCenterChannel])

            const { rerender } = renderSettings()

            rerender(<OrderManagementSettings />)

            await waitFor(() => {
                expect(screen.getByText('Help Center')).toBeInTheDocument()
            })
        })
    })
})
