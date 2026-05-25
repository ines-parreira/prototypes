import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'

import { EditReportOrderIssueFlowScenarioViewContainer } from '../EditReportOrderIssueFlowScenarioViewContainer'

jest.mock('pages/automate/common/hooks/useStoreIntegrations')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp',
)

jest.mock(
    '../legacy/reportOrderIssue/EditReportOrderIssueFlowScenarioViewContainer',
    () => ({
        __esModule: true,
        default: () => (
            <div>LegacyEditReportOrderIssueFlowScenarioViewContainer</div>
        ),
    }),
)

jest.mock(
    '../revamp/reportOrderIssue/editScenario/EditReportOrderIssueFlowScenarioViewContainer',
    () => ({
        EditReportOrderIssueFlowScenarioViewContainerRevamp: () => (
            <div>RevampEditReportOrderIssueFlowScenarioViewContainer</div>
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
    shouldShowChatSettingsRevamp: false,
    shouldShowFlowsScreensRevamp: false,
    shouldShowOrderManagementScreensRevamp: false,
    isLoading: false,
}

describe('EditReportOrderIssueFlowScenarioViewContainer', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStoreIntegrations.mockReturnValue([])
        mockUseShouldShowChatSettingsRevamp.mockReturnValue(defaultRevampFlags)
    })

    it('should render the revamp view when shouldShowOrderManagementScreensRevamp is true', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            ...defaultRevampFlags,
            shouldShowOrderManagementScreensRevamp: true,
        })

        render(<EditReportOrderIssueFlowScenarioViewContainer />)

        expect(
            screen.getByText(
                'RevampEditReportOrderIssueFlowScenarioViewContainer',
            ),
        ).toBeInTheDocument()
        expect(
            screen.queryByText(
                'LegacyEditReportOrderIssueFlowScenarioViewContainer',
            ),
        ).not.toBeInTheDocument()
    })

    it('should render the legacy view when shouldShowOrderManagementScreensRevamp is false', () => {
        render(<EditReportOrderIssueFlowScenarioViewContainer />)

        expect(
            screen.getByText(
                'LegacyEditReportOrderIssueFlowScenarioViewContainer',
            ),
        ).toBeInTheDocument()
        expect(
            screen.queryByText(
                'RevampEditReportOrderIssueFlowScenarioViewContainer',
            ),
        ).not.toBeInTheDocument()
    })
})
