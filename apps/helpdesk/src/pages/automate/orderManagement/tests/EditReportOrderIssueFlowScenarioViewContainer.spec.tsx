import { render, screen } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'

import { EditReportOrderIssueFlowScenarioViewContainer } from '../EditReportOrderIssueFlowScenarioViewContainer'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))
jest.mock('hooks/useAppSelector')
jest.mock('pages/automate/common/hooks/useStoreIntegrations')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp',
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

const defaultRevampFlags = {
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

describe('EditReportOrderIssueFlowScenarioViewContainer', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseParams.mockReturnValue({ shopName: 'my-store' })
        mockUseAppSelector.mockReturnValue(undefined)
        mockUseStoreIntegrations.mockReturnValue([])
        mockUseShouldShowChatSettingsRevamp.mockReturnValue(defaultRevampFlags)
    })

    it('should render the revamp view when shouldShowOrderManagementScreensRevamp is true', async () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            ...defaultRevampFlags,
            shouldShowOrderManagementScreensRevamp: true,
        })

        render(<EditReportOrderIssueFlowScenarioViewContainer />)

        expect(
            await screen.findByText(
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
