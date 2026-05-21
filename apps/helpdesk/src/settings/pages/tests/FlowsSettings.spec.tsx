import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'

import { AGENT_ROLE } from 'config/user'
import { user } from 'fixtures/users'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { StoreIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import { useStoreSelector } from 'settings/automate'
import { getHasAutomate } from 'state/billing/selectors'
import type { RootState } from 'state/types'

import { BASE_PATH, FlowsSettings } from '../FlowsSettings'

jest.mock('settings/automate', () => ({
    ...jest.requireActual('settings/automate'),
    useStoreSelector: jest.fn(),
}))

jest.mock('state/billing/selectors', () => ({ getHasAutomate: jest.fn() }))

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

const getHasAutomateMock = assumeMock(getHasAutomate)
const useStoreSelectorMock = assumeMock(useStoreSelector)
const useAiAgentAccessMock = assumeMock(useAiAgentAccess)
const mockUseShouldShowChatSettingsRevamp = jest.requireMock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp',
).useShouldShowChatSettingsRevamp as jest.Mock
const mockUseChatPreviewPanel = jest.requireMock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
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
            name: AGENT_ROLE,
        },
    }),
}

describe('FlowsSettings', () => {
    const integrations = [
        {
            id: 1,
            type: IntegrationType.Shopify,
            name: 'my-first-store',
            meta: {},
        },
    ] as StoreIntegration[]

    let onChange: jest.Mock

    const renderSettings = (route = BASE_PATH) =>
        render(<FlowsSettings />, {
            initialEntries: [route],
            path: `${BASE_PATH}/:shopType?/:shopName?`,
            storeState: initialState,
        })

    beforeEach(() => {
        onChange = jest.fn()
        getHasAutomateMock.mockReturnValue(true)
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
            shouldShowRevampForNonAiAgent: false,
            shouldShowFlowsScreensRevamp: false,
            shouldShowOrderManagementScreensRevamp: false,
            isLoading: false,
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampFlowsEnabled: false,
            isChatSettingsScreensRevampOrderManagementEnabled: false,
            isNonAiAgentChat2RevampEnabled: false,
        })
        mockUseChatPreviewPanel.mockReturnValue({
            chatPreviewPortal: null,
            showPreviewPanel: jest.fn(),
            hidePreviewPanel: jest.fn(),
        })
    })

    it('should render the header', () => {
        renderSettings()
        expect(screen.getByText('Flows')).toBeInTheDocument()
    })

    it('should not render the navigation if no store is selected', () => {
        renderSettings()
        expect(screen.queryByText('Configuration')).not.toBeInTheDocument()
    })

    it('should render the navigation once a store has been selected', () => {
        useStoreSelectorMock.mockReturnValue({
            integrations,
            onChange,
            selected: integrations[0],
        })

        renderSettings(`${BASE_PATH}/shopify/my-first-store`)
        expect(screen.getByText('Configuration')).toBeInTheDocument()
    })
})
