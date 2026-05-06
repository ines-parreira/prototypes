import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useChatPreviewChannelsContext } from 'pages/automate/connectedChannels/revamp/hooks/useChatPreviewChannels'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'

import { TrackOrderFlowViewContainer } from '../TrackOrderFlowViewContainer'

jest.mock('pages/automate/common/hooks/useStoreIntegrations')
jest.mock(
    'pages/automate/connectedChannels/revamp/hooks/useChatPreviewChannels',
)
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp',
)

jest.mock('../legacy/trackOrder/TrackOrderFlowViewContainer', () => ({
    __esModule: true,
    default: () => <div>LegacyTrackOrderFlowViewContainer</div>,
}))

jest.mock('../revamp/trackOrder/TrackOrderFlowViewContainer', () => ({
    TrackOrderFlowViewContainerRevamp: () => (
        <div>RevampTrackOrderFlowViewContainer</div>
    ),
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

describe('TrackOrderFlowViewContainer', () => {
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

        render(<TrackOrderFlowViewContainer />)

        expect(
            screen.getByText('RevampTrackOrderFlowViewContainer'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('LegacyTrackOrderFlowViewContainer'),
        ).not.toBeInTheDocument()
    })

    it('should render the legacy view when shouldShowOrderManagementScreensRevamp is false', () => {
        render(<TrackOrderFlowViewContainer />)

        expect(
            screen.getByText('LegacyTrackOrderFlowViewContainer'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('RevampTrackOrderFlowViewContainer'),
        ).not.toBeInTheDocument()
    })
})
