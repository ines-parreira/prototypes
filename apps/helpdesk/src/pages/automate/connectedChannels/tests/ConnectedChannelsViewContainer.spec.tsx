import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { ChatPreviewChannelsContext } from 'pages/automate/connectedChannels/revamp/hooks/useChatPreviewChannels'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'

import { ConnectedChannelsViewContainer } from '../ConnectedChannelsViewContainer'

jest.mock('pages/automate/common/hooks/useStoreIntegrations')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp',
)

jest.mock('../legacy/ConnectedChannelsViewContainer', () => ({
    __esModule: true,
    default: () => <div>LegacyConnectedChannelsViewContainer</div>,
}))

jest.mock('../revamp/ConnectedChannelsViewContainer', () => ({
    __esModule: true,
    ConnectedChannelsViewContainerRevamp: () => (
        <div>RevampConnectedChannelsViewContainer</div>
    ),
}))

const mockUseStoreIntegrations = useStoreIntegrations as jest.MockedFunction<
    typeof useStoreIntegrations
>
const mockUseShouldShowChatSettingsRevamp =
    useShouldShowChatSettingsRevamp as jest.MockedFunction<
        typeof useShouldShowChatSettingsRevamp
    >

const defaultMockFlags = {
    isChatSettingsRevampEnabled: false,
    isChatSettingsScreensRevampEnabled: false,
    isChatSettingsScreensRevampChatSettingsEnabled: false,
    isChatSettingsScreensRevampFlowsEnabled: false,
    isChatSettingsScreensRevampOrderManagementEnabled: false,
    shouldShowRevampWhenAiAgentEnabled: false,
    shouldShowScreensRevampWhenAiAgentEnabled: false,
    shouldShowChatSettingsScreensRevamp: false,
    shouldShowFlowsScreensRevamp: false,
    shouldShowOrderManagementScreensRevamp: false,
    isLoading: false,
}

const renderWithContext = ({
    withProvider = true,
}: { withProvider?: boolean } = {}) => {
    const content = (
        <MemoryRouter initialEntries={['/shopify/my-store']}>
            <Route path="/:shopType/:shopName">
                <ConnectedChannelsViewContainer />
            </Route>
        </MemoryRouter>
    )

    if (!withProvider) {
        return render(content)
    }

    return render(
        <ChatPreviewChannelsContext.Provider
            value={{
                shopName: 'my-store',
                selectedChannelId: undefined,
                setSelectedChannelId: jest.fn(),
            }}
        >
            {content}
        </ChatPreviewChannelsContext.Provider>,
    )
}

describe('ConnectedChannelsViewContainer', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStoreIntegrations.mockReturnValue([])
        mockUseShouldShowChatSettingsRevamp.mockReturnValue(defaultMockFlags)
    })

    it('should render the revamp container when shouldShowFlowsScreensRevamp is true', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            ...defaultMockFlags,
            shouldShowFlowsScreensRevamp: true,
        })

        renderWithContext()

        expect(
            screen.getByText('RevampConnectedChannelsViewContainer'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('LegacyConnectedChannelsViewContainer'),
        ).not.toBeInTheDocument()
    })

    it('should render the legacy container when shouldShowFlowsScreensRevamp is false', () => {
        renderWithContext()

        expect(
            screen.getByText('LegacyConnectedChannelsViewContainer'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('RevampConnectedChannelsViewContainer'),
        ).not.toBeInTheDocument()
    })

    it('should render without crashing when ChatPreviewChannelsContext provider is absent', () => {
        renderWithContext({ withProvider: false })

        expect(
            screen.getByText('LegacyConnectedChannelsViewContainer'),
        ).toBeInTheDocument()
    })
})
