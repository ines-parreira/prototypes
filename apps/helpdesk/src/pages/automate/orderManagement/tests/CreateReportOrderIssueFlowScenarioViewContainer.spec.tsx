import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useStoreIntegrations } from 'pages/automate/common/hooks/useStoreIntegrations'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'

import { CreateReportOrderIssueFlowScenarioViewContainer } from '../CreateReportOrderIssueFlowScenarioViewContainer'

jest.mock('pages/automate/common/hooks/useStoreIntegrations')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp',
)

jest.mock(
    '../legacy/reportOrderIssue/CreateReportOrderIssueFlowScenarioViewContainer',
    () => ({
        __esModule: true,
        CreateReportOrderIssueFlowScenarioViewContainer: () => (
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
const mockUseShouldShowChatSettingsRevamp =
    useShouldShowChatSettingsRevamp as jest.MockedFunction<
        typeof useShouldShowChatSettingsRevamp
    >

const defaultRevampFlags = {
    isChatSettingsRevampEnabled: false,
    isChatSettingsScreensRevampFlowsEnabled: false,
    isChatSettingsScreensRevampOrderManagementEnabled: false,
    isNonAiAgentChat2RevampEnabled: false,
    shouldShowNonAiAgentChatSettingsRevamp: false,
    shouldShowChatSettingsRevamp: false,
    shouldShowFlowsScreensRevamp: false,
    shouldShowOrderManagementScreensRevamp: false,
    shouldShowNonAiAgentRevamp: false,
    shouldShowLegacyChatCustomization: false,
    isLoading: false,
}

describe('CreateReportOrderIssueFlowScenarioViewContainer', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStoreIntegrations.mockReturnValue([])
        mockUseShouldShowChatSettingsRevamp.mockReturnValue(defaultRevampFlags)
    })

    it('should render the revamp view when shouldShowOrderManagementScreensRevamp is true', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            ...defaultRevampFlags,
            shouldShowOrderManagementScreensRevamp: true,
            shouldShowNonAiAgentRevamp: false,
            shouldShowLegacyChatCustomization: false,
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
