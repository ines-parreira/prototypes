import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useChatPreviewChannelsContext } from 'pages/automate/connectedChannels/revamp/hooks/useChatPreviewChannels'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'

import { CreateReportOrderIssueFlowScenarioViewContainer } from '../CreateReportOrderIssueFlowScenarioViewContainer'

jest.mock('pages/automate/common/hooks/useStoreIntegrations')
jest.mock(
    'pages/automate/connectedChannels/revamp/hooks/useChatPreviewChannels',
)
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp',
)

jest.mock(
    '../legacy/reportOrderIssue/CreateReportOrderIssueFlowScenarioViewContainer',
    () => ({
        __esModule: true,
        default: () => (
            <div>LegacyCreateReportOrderIssueFlowScenarioViewContainer</div>
        ),
    }),
)

jest.mock(
    '../revamp/reportOrderIssue/newScenario/CreateReportOrderIssueFlowScenarioViewContainer',
    () => ({
        CreateReportOrderIssueFlowScenarioViewContainerRevamp: () => (
            <div>RevampCreateReportOrderIssueFlowScenarioViewContainer</div>
        ),
    }),
)

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

const defaultRevampFlags = {
    isChatSettingsRevampEnabled: false,
    isChatSettingsScreensRevampChatSettingsEnabled: false,
    isChatSettingsScreensRevampFlowsEnabled: false,
    isChatSettingsScreensRevampOrderManagementEnabled: false,
    shouldShowRevampWhenAiAgentEnabled: false,
    shouldShowChatSettingsScreensRevamp: false,
    shouldShowFlowsScreensRevamp: false,
    shouldShowOrderManagementScreensRevamp: false,
    isLoading: false,
}

describe('CreateReportOrderIssueFlowScenarioViewContainer', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStoreIntegrations.mockReturnValue([])
        mockUseChatPreviewChannelsContext.mockReturnValue({
            shopName: 'my-store',
            selectedChannelId: undefined,
            setSelectedChannelId: jest.fn(),
        })
        mockUseShouldShowChatSettingsRevamp.mockReturnValue(defaultRevampFlags)
    })

    it('should render the revamp view when shouldShowOrderManagementScreensRevamp is true', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            ...defaultRevampFlags,
            shouldShowOrderManagementScreensRevamp: true,
        })

        render(<CreateReportOrderIssueFlowScenarioViewContainer />)

        expect(
            screen.getByText(
                'RevampCreateReportOrderIssueFlowScenarioViewContainer',
            ),
        ).toBeInTheDocument()
        expect(
            screen.queryByText(
                'LegacyCreateReportOrderIssueFlowScenarioViewContainer',
            ),
        ).not.toBeInTheDocument()
    })

    it('should render the legacy view when shouldShowOrderManagementScreensRevamp is false', () => {
        render(<CreateReportOrderIssueFlowScenarioViewContainer />)

        expect(
            screen.getByText(
                'LegacyCreateReportOrderIssueFlowScenarioViewContainer',
            ),
        ).toBeInTheDocument()
        expect(
            screen.queryByText(
                'RevampCreateReportOrderIssueFlowScenarioViewContainer',
            ),
        ).not.toBeInTheDocument()
    })
})
