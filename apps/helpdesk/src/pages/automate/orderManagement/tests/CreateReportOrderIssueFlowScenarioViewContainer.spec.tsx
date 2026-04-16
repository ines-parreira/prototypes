import { render, screen } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'

import { CreateReportOrderIssueFlowScenarioViewContainer } from '../CreateReportOrderIssueFlowScenarioViewContainer'

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

describe('CreateReportOrderIssueFlowScenarioViewContainer', () => {
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

        render(<CreateReportOrderIssueFlowScenarioViewContainer />)

        expect(
            await screen.findByText(
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
