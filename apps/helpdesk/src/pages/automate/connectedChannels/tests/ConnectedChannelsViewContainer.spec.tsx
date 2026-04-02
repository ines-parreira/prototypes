import { render, screen } from '@testing-library/react'
import { useParams, useRouteMatch } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'

import { ConnectedChannelsViewContainer } from '../ConnectedChannelsViewContainer'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
    useRouteMatch: jest.fn(),
}))
jest.mock('hooks/useAppSelector')
jest.mock('pages/automate/common/hooks/useStoreIntegrations')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp',
)
jest.mock('settings/pages/OrderManagementSettings', () => ({
    BASE_PATH: '/app/settings/order-management',
}))

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
const mockUseRouteMatch = useRouteMatch as jest.MockedFunction<
    typeof useRouteMatch
>
const mockUseAppSelector = useAppSelector as jest.MockedFunction<
    typeof useAppSelector
>
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
        mockUseRouteMatch.mockReturnValue(null)
        mockUseAppSelector.mockReturnValue(undefined)
        mockUseStoreIntegrations.mockReturnValue([])
        mockUseShouldShowChatSettingsRevamp.mockReturnValue(defaultMockFlags)
    })

    describe('on the flows path', () => {
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

    describe('on the order management path', () => {
        beforeEach(() => {
            mockUseRouteMatch.mockReturnValue({
                url: '/app/settings/order-management',
            } as any)
        })

        it('should render the revamp container when shouldShowOrderManagementScreensRevamp is true', () => {
            mockUseShouldShowChatSettingsRevamp.mockReturnValue({
                ...defaultMockFlags,
                shouldShowOrderManagementScreensRevamp: true,
            })

            render(<ConnectedChannelsViewContainer />)

            expect(
                screen.getByText('RevampConnectedChannelsViewContainer'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('LegacyConnectedChannelsViewContainer'),
            ).not.toBeInTheDocument()
        })

        it('should render the legacy container when shouldShowOrderManagementScreensRevamp is false', () => {
            render(<ConnectedChannelsViewContainer />)

            expect(
                screen.getByText('LegacyConnectedChannelsViewContainer'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('RevampConnectedChannelsViewContainer'),
            ).not.toBeInTheDocument()
        })

        it('should not use shouldShowFlowsScreensRevamp when on order management path', () => {
            mockUseShouldShowChatSettingsRevamp.mockReturnValue({
                ...defaultMockFlags,
                shouldShowFlowsScreensRevamp: true,
                shouldShowOrderManagementScreensRevamp: false,
            })

            render(<ConnectedChannelsViewContainer />)

            expect(
                screen.getByText('LegacyConnectedChannelsViewContainer'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('RevampConnectedChannelsViewContainer'),
            ).not.toBeInTheDocument()
        })
    })
})
