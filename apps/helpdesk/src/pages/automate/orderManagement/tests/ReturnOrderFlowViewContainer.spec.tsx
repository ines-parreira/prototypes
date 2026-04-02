import { render, screen } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'

import { ReturnOrderFlowViewContainer } from '../ReturnOrderFlowViewContainer'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))
jest.mock('hooks/useAppSelector')
jest.mock('pages/automate/common/hooks/useStoreIntegrations')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp',
)

jest.mock('../legacy/returnOrder/ReturnOrderFlowViewContainer', () => ({
    __esModule: true,
    default: () => <div>LegacyReturnOrderFlowViewContainer</div>,
}))

jest.mock('../revamp/returnOrder/ReturnOrderFlowViewContainer', () => ({
    ReturnOrderFlowViewContainerRevamp: () => (
        <div>RevampReturnOrderFlowViewContainer</div>
    ),
}))

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
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

describe('ReturnOrderFlowViewContainer', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseParams.mockReturnValue({ shopName: 'my-store' })
        mockUseAppSelector.mockReturnValue(undefined)
        mockUseStoreIntegrations.mockReturnValue([])
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
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
        })
    })

    it('should render the revamp view when shouldShowOrderManagementScreensRevamp is true', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: true,
            isChatSettingsScreensRevampEnabled: true,
            isChatSettingsScreensRevampChatSettingsEnabled: false,
            isChatSettingsScreensRevampFlowsEnabled: false,
            isChatSettingsScreensRevampOrderManagementEnabled: false,
            shouldShowRevampWhenAiAgentEnabled: true,
            shouldShowScreensRevampWhenAiAgentEnabled: true,
            shouldShowChatSettingsScreensRevamp: false,
            shouldShowFlowsScreensRevamp: false,
            shouldShowOrderManagementScreensRevamp: true,
            isLoading: false,
        })

        render(<ReturnOrderFlowViewContainer />)

        expect(
            screen.getByText('RevampReturnOrderFlowViewContainer'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('LegacyReturnOrderFlowViewContainer'),
        ).not.toBeInTheDocument()
    })

    it('should render the legacy view when shouldShowOrderManagementScreensRevamp is false', () => {
        render(<ReturnOrderFlowViewContainer />)

        expect(
            screen.getByText('LegacyReturnOrderFlowViewContainer'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('RevampReturnOrderFlowViewContainer'),
        ).not.toBeInTheDocument()
    })
})
