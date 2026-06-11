import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { selfServiceConfiguration1 } from 'fixtures/self_service_configurations'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { useSelfServiceConfiguration } from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import type { RootState } from 'state/types'

import { CreateReportOrderIssueFlowScenarioView } from '../CreateReportOrderIssueFlowScenarioView'
import { CreateReportOrderIssueFlowScenarioViewContainer } from '../CreateReportOrderIssueFlowScenarioViewContainer'

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')
jest.mock('hooks/aiAgent/useAiAgentAccess')
jest.mock(
    'pages/automate/connectedChannels/revamp/hooks/useChatPreviewChannels',
    () => ({
        useChatPreviewChannelsContext: jest.fn().mockReturnValue({
            shopName: 'my-store',
            selectedChannelId: undefined,
            setSelectedChannelId: jest.fn(),
        }),
    }),
)
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    Redirect: jest.fn(() => <div>Redirect</div>),
}))
describe('<CreateReportOrderIssueFlowScenarioView />', () => {
    beforeEach(() => {
        ;(
            useSelfServiceConfiguration as jest.MockedFn<
                typeof useSelfServiceConfiguration
            >
        ).mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: selfServiceConfiguration1,
            handleSelfServiceConfigurationUpdate: jest.fn(),
        })
    })
    it('should render order issue flow scenario view', () => {
        render(<CreateReportOrderIssueFlowScenarioView />, {
            storeState: {
                integrations: fromJS({
                    integrations: [],
                }),
                billing: fromJS({
                    products: [],
                }),
            } as RootState,
        })
        expect(screen.getByText('Create scenario')).toBeInTheDocument()
    })
})
describe('<CreateReportOrderIssueFlowScenarioViewContainer />', () => {
    beforeEach(() => {
        ;(
            useSelfServiceConfiguration as jest.MockedFn<
                typeof useSelfServiceConfiguration
            >
        ).mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: selfServiceConfiguration1,
            handleSelfServiceConfigurationUpdate: jest.fn(),
        })
        ;(useAiAgentAccess as jest.Mock).mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
    })
    it('should redirect when user does not have access', () => {
        render(<CreateReportOrderIssueFlowScenarioViewContainer />, {
            storeState: {
                integrations: fromJS({
                    integrations: [],
                }),
                billing: fromJS({
                    products: [],
                }),
            } as RootState,
        })
        expect(screen.getByText('Redirect')).toBeInTheDocument()
    })
    it('should render order issue flow scenario view when user has access', () => {
        ;(useAiAgentAccess as jest.Mock).mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        render(<CreateReportOrderIssueFlowScenarioViewContainer />, {
            storeState: {
                integrations: fromJS({
                    integrations: [],
                }),
                billing: fromJS({
                    products: [],
                }),
            } as RootState,
        })
        expect(screen.getByText('Create scenario')).toBeInTheDocument()
    })
})
