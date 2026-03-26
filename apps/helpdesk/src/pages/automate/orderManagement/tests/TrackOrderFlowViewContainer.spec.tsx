import { render, screen } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'

import { TrackOrderFlowViewContainer } from '../TrackOrderFlowViewContainer'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))
jest.mock('hooks/useAppSelector')
jest.mock('pages/automate/common/hooks/useStoreIntegrations')
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

describe('TrackOrderFlowViewContainer', () => {
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

        render(<TrackOrderFlowViewContainer />)

        expect(
            screen.getByText('RevampTrackOrderFlowViewContainer'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('LegacyTrackOrderFlowViewContainer'),
        ).not.toBeInTheDocument()
    })

    it('should render the legacy view when shouldShowScreensRevampWhenAiAgentEnabled is false', () => {
        render(<TrackOrderFlowViewContainer />)

        expect(
            screen.getByText('LegacyTrackOrderFlowViewContainer'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('RevampTrackOrderFlowViewContainer'),
        ).not.toBeInTheDocument()
    })
})
