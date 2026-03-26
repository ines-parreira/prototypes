import { render, screen } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'

import { CancelOrderFlowViewContainer } from '../CancelOrderFlowViewContainer'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))
jest.mock('hooks/useAppSelector')
jest.mock('pages/automate/common/hooks/useStoreIntegrations')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp',
)

jest.mock('../legacy/cancelOrder/CancelOrderFlowViewContainer', () => ({
    __esModule: true,
    default: () => <div>LegacyCancelOrderFlowViewContainer</div>,
}))

jest.mock('../revamp/cancelOrder/CancelOrderFlowViewContainer', () => ({
    CancelOrderFlowViewContainerRevamp: () => (
        <div>RevampCancelOrderFlowViewContainer</div>
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

describe('CancelOrderFlowViewContainer', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseParams.mockReturnValue({ shopName: 'my-store' })
        mockUseAppSelector.mockReturnValue(undefined)
        mockUseStoreIntegrations.mockReturnValue([])
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampEnabled: false,
            shouldShowRevampWhenAiAgentEnabled: false,
            shouldShowScreensRevampWhenAiAgentEnabled: false,
            isLoading: false,
        })
    })

    it('should render the revamp view when shouldShowScreensRevampWhenAiAgentEnabled is true', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: true,
            isChatSettingsScreensRevampEnabled: true,
            shouldShowRevampWhenAiAgentEnabled: true,
            shouldShowScreensRevampWhenAiAgentEnabled: true,
            isLoading: false,
        })

        render(<CancelOrderFlowViewContainer />)

        expect(
            screen.getByText('RevampCancelOrderFlowViewContainer'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('LegacyCancelOrderFlowViewContainer'),
        ).not.toBeInTheDocument()
    })

    it('should render the legacy view when shouldShowScreensRevampWhenAiAgentEnabled is false', () => {
        render(<CancelOrderFlowViewContainer />)

        expect(
            screen.getByText('LegacyCancelOrderFlowViewContainer'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('RevampCancelOrderFlowViewContainer'),
        ).not.toBeInTheDocument()
    })
})
