import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useChatPreviewChannelsContext } from 'pages/automate/connectedChannels/revamp/hooks/useChatPreviewChannels'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'

import { OrderManagementViewContainer } from '../OrderManagementViewContainer'

jest.mock('pages/automate/common/hooks/useStoreIntegrations')
jest.mock(
    'pages/automate/connectedChannels/revamp/hooks/useChatPreviewChannels',
)
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp',
)

jest.mock('../legacy/OrderManagementView', () => ({
    __esModule: true,
    default: () => <div>LegacyOrderManagementView</div>,
}))

jest.mock('../revamp/OrderManagementView', () => ({
    __esModule: true,
    OrderManagementViewRevamp: () => <div>RevampOrderManagementView</div>,
}))

const mockUseStoreIntegrations = useStoreIntegrations as jest.MockedFunction<
    typeof useStoreIntegrations
>
const mockUseChatPreviewChannelsContext =
    useChatPreviewChannelsContext as jest.MockedFunction<
        typeof useChatPreviewChannelsContext
    >
const mockUseShouldShowChatSettingsRevamp =
    useShouldShowChatSettingsRevamp as jest.MockedFunction<
        typeof useShouldShowChatSettingsRevamp
    >

describe('OrderManagementViewContainer', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStoreIntegrations.mockReturnValue([])
        mockUseChatPreviewChannelsContext.mockReturnValue({
            shopName: 'my-store',
            selectedChannelId: undefined,
            setSelectedChannelId: jest.fn(),
        })
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampChatSettingsEnabled: false,
            isChatSettingsScreensRevampFlowsEnabled: false,
            isChatSettingsScreensRevampOrderManagementEnabled: false,
            shouldShowRevampWhenAiAgentEnabled: false,
            shouldShowChatSettingsScreensRevamp: false,
            shouldShowFlowsScreensRevamp: false,
            shouldShowOrderManagementScreensRevamp: false,
            isLoading: false,
        })
    })

    it('should render the revamp view when shouldShowOrderManagementScreensRevamp is true', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: true,
            isChatSettingsScreensRevampChatSettingsEnabled: false,
            isChatSettingsScreensRevampFlowsEnabled: false,
            isChatSettingsScreensRevampOrderManagementEnabled: false,
            shouldShowRevampWhenAiAgentEnabled: true,
            shouldShowChatSettingsScreensRevamp: false,
            shouldShowFlowsScreensRevamp: false,
            shouldShowOrderManagementScreensRevamp: true,
            isLoading: false,
        })

        render(<OrderManagementViewContainer />)

        expect(
            screen.getByText('RevampOrderManagementView'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('LegacyOrderManagementView'),
        ).not.toBeInTheDocument()
    })

    it('should render the legacy view when shouldShowOrderManagementScreensRevamp is false', () => {
        render(<OrderManagementViewContainer />)

        expect(
            screen.getByText('LegacyOrderManagementView'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('RevampOrderManagementView'),
        ).not.toBeInTheDocument()
    })
})
