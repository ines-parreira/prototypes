import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'

import { ReportOrderIssueFlowViewContainer } from '../ReportOrderIssueFlowViewContainer'

jest.mock('pages/automate/common/hooks/useStoreIntegrations')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp',
)

jest.mock(
    '../legacy/reportOrderIssue/ReportOrderIssueFlowViewContainer',
    () => ({
        __esModule: true,
        default: () => <div>LegacyReportOrderIssueFlowViewContainer</div>,
    }),
)

jest.mock(
    '../revamp/reportOrderIssue/ReportOrderIssueFlowViewContainer',
    () => ({
        ReportOrderIssueFlowViewContainerRevamp: () => (
            <div>RevampReportOrderIssueFlowViewContainer</div>
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

describe('ReportOrderIssueFlowViewContainer', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStoreIntegrations.mockReturnValue([])
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampFlowsEnabled: false,
            isChatSettingsScreensRevampOrderManagementEnabled: false,
            shouldShowRevampWhenAiAgentEnabled: false,
            shouldShowFlowsScreensRevamp: false,
            shouldShowOrderManagementScreensRevamp: false,
            isLoading: false,
        })
    })

    it('should render the revamp view when shouldShowOrderManagementScreensRevamp is true', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: true,
            isChatSettingsScreensRevampFlowsEnabled: false,
            isChatSettingsScreensRevampOrderManagementEnabled: false,
            shouldShowRevampWhenAiAgentEnabled: true,
            shouldShowFlowsScreensRevamp: false,
            shouldShowOrderManagementScreensRevamp: true,
            isLoading: false,
        })

        render(<ReportOrderIssueFlowViewContainer />)

        expect(
            screen.getByText('RevampReportOrderIssueFlowViewContainer'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('LegacyReportOrderIssueFlowViewContainer'),
        ).not.toBeInTheDocument()
    })

    it('should render the legacy view when shouldShowOrderManagementScreensRevamp is false', () => {
        render(<ReportOrderIssueFlowViewContainer />)

        expect(
            screen.getByText('LegacyReportOrderIssueFlowViewContainer'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('RevampReportOrderIssueFlowViewContainer'),
        ).not.toBeInTheDocument()
    })
})
