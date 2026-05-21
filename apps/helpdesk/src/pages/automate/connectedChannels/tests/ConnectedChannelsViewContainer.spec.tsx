import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'

import { ConnectedChannelsViewContainer } from '../ConnectedChannelsViewContainer'

jest.mock('pages/automate/common/hooks/useStoreIntegrations')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp',
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
    isChatSettingsScreensRevampFlowsEnabled: false,
    isChatSettingsScreensRevampOrderManagementEnabled: false,
    isNonAiAgentChat2RevampEnabled: false,
    shouldShowRevampWhenAiAgentEnabled: false,
    shouldShowRevampForNonAiAgent: false,
    shouldShowFlowsScreensRevamp: false,
    shouldShowOrderManagementScreensRevamp: false,
    isLoading: false,
}

const renderComponent = () =>
    render(
        <MemoryRouter initialEntries={['/shopify/my-store']}>
            <Route path="/:shopType/:shopName">
                <ConnectedChannelsViewContainer />
            </Route>
        </MemoryRouter>,
    )

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

        renderComponent()

        expect(
            screen.getByText('RevampConnectedChannelsViewContainer'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('LegacyConnectedChannelsViewContainer'),
        ).not.toBeInTheDocument()
    })

    it('should render the legacy container when shouldShowFlowsScreensRevamp is false', () => {
        renderComponent()

        expect(
            screen.getByText('LegacyConnectedChannelsViewContainer'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('RevampConnectedChannelsViewContainer'),
        ).not.toBeInTheDocument()
    })

    it('should derive shopName from route params', () => {
        mockUseShouldShowChatSettingsRevamp.mockImplementation(
            (storeIntegration) => {
                expect(storeIntegration).toBeUndefined()
                return defaultMockFlags
            },
        )

        renderComponent()

        expect(
            screen.getByText('LegacyConnectedChannelsViewContainer'),
        ).toBeInTheDocument()
    })
})
