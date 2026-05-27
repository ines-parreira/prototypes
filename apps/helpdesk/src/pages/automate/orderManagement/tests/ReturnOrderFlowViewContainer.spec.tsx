import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'

import { ReturnOrderFlowViewContainer } from '../ReturnOrderFlowViewContainer'

jest.mock('pages/automate/common/hooks/useStoreIntegrations')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp',
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
        mockUseStoreIntegrations.mockReturnValue([])
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampFlowsEnabled: false,
            isChatSettingsScreensRevampOrderManagementEnabled: false,
            isNonAiAgentChat2RevampEnabled: false,
            shouldShowNonAiAgentChatSettingsRevamp: false,
            shouldShowChatSettingsRevamp: false,
            shouldShowFlowsScreensRevamp: false,
            shouldShowOrderManagementScreensRevamp: false,
            isLoading: false,
            shouldShowNonAiAgentRevamp: false,
        })
    })

    it('should render the revamp view when shouldShowOrderManagementScreensRevamp is true', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: true,
            isChatSettingsScreensRevampFlowsEnabled: false,
            isChatSettingsScreensRevampOrderManagementEnabled: false,
            isNonAiAgentChat2RevampEnabled: false,
            shouldShowNonAiAgentChatSettingsRevamp: false,
            shouldShowChatSettingsRevamp: true,
            shouldShowFlowsScreensRevamp: false,
            shouldShowOrderManagementScreensRevamp: true,
            isLoading: false,
            shouldShowNonAiAgentRevamp: false,
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
