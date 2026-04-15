import { render, screen } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'

import { ConnectedChannelsViewContainer } from '../ConnectedChannelsViewContainer'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))
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

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
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

describe('ConnectedChannelsViewContainer', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseParams.mockReturnValue({ shopName: 'my-store' })
        mockUseStoreIntegrations.mockReturnValue([])
        mockUseShouldShowChatSettingsRevamp.mockReturnValue(defaultMockFlags)
    })

    it('should render the revamp container when shouldShowFlowsScreensRevamp is true', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            ...defaultMockFlags,
            shouldShowFlowsScreensRevamp: true,
        })

        render(<ConnectedChannelsViewContainer />)

        expect(
            screen.getByText('RevampConnectedChannelsViewContainer'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('LegacyConnectedChannelsViewContainer'),
        ).not.toBeInTheDocument()
    })

    it('should render the legacy container when shouldShowFlowsScreensRevamp is false', () => {
        render(<ConnectedChannelsViewContainer />)

        expect(
            screen.getByText('LegacyConnectedChannelsViewContainer'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('RevampConnectedChannelsViewContainer'),
        ).not.toBeInTheDocument()
    })
})
