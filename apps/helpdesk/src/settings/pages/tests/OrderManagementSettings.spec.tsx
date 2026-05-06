import type { ReactNode } from 'react'

import { UserRole } from '@repo/permissions'
import { assumeMock, render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'

import { user } from 'fixtures/users'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { StoreIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
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
    'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp',
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
    () => ({
        ...jest.requireActual(
            'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
        ),
        useChatPreviewPanel: jest.fn(),
    }),
)

jest.mock(
    'pages/automate/orderManagement/legacy/OrderManagementPreviewProvider',
    () => ({
        __esModule: true,
        default: ({ children }: { children?: ReactNode }) => <>{children}</>,
    }),
)

jest.mock(
    'pages/automate/orderManagement/OrderManagementViewContainer',
    () => ({
        __esModule: true,
        OrderManagementViewContainer: () => <div>OrderManagementView</div>,
    }),
)

const useStoreSelectorMock = assumeMock(useStoreSelector)
const useAiAgentAccessMock = assumeMock(useAiAgentAccess)
const mockUseShouldShowChatSettingsRevamp = jest.requireMock(
    'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp',
).useShouldShowChatSettingsRevamp as jest.Mock
const mockUseChatPreviewPanel = jest.requireMock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
).useChatPreviewPanel as jest.Mock

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
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevampWhenAiAgentEnabled: false,
            shouldShowChatSettingsScreensRevamp: false,
            shouldShowFlowsScreensRevamp: false,
            shouldShowOrderManagementScreensRevamp: false,
            isLoading: false,
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampChatSettingsEnabled: false,
            isChatSettingsScreensRevampFlowsEnabled: false,
            isChatSettingsScreensRevampOrderManagementEnabled: false,
        })
        mockUseChatPreviewPanel.mockReturnValue({
            chatPreviewPortal: null,
            showPreviewPanel: jest.fn(),
            hidePreviewPanel: jest.fn(),
            onChatPreviewLoaded: jest.fn(() => jest.fn()),
            updateTexts: jest.fn(),
            updateSSPTexts: jest.fn(),
        })
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
                shouldShowChatSettingsScreensRevamp: false,
                shouldShowFlowsScreensRevamp: false,
                shouldShowOrderManagementScreensRevamp: true,
                isLoading: false,
                isChatSettingsRevampEnabled: false,
                isChatSettingsScreensRevampChatSettingsEnabled: false,
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
            mockUseChatPreviewPanel.mockReturnValue({
                chatPreviewPortal: null,
                showPreviewPanel: jest.fn(),
                hidePreviewPanel: jest.fn(),
                onChatPreviewLoaded,
                updateTexts: jest.fn(),
                updateSSPTexts,
            })

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
})
