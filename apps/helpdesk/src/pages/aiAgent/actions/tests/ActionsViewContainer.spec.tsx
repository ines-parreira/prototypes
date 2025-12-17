import { useFlag } from '@repo/feature-flags'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { billingState } from 'fixtures/billing'
import { IntegrationType } from 'models/integration/constants'
import {
    useGetStoreWorkflowsConfigurations,
    useGetWorkflowConfigurationTemplates,
    useListTrackstarConnections,
} from 'models/workflows/queries'
import { SUPPORT_ACTIONS } from 'pages/aiAgent/constants'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import ActionsViewContainer from '../ActionsViewContainer'
import { actionConfigurationFixture } from '../hooks/tests/actions.fixtures'

jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.mock('../components/ActionsList', () => () => <div>ActionsList</div>)
jest.mock('pages/AppContext')
jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')
jest.mock('pages/aiAgent/hooks/usePlaygroundPanel')

jest.mock('models/workflows/queries', () => ({
    useGetStoreWorkflowsConfigurations: jest.fn(),
    useGetWorkflowConfigurationTemplates: jest.fn(),
    useListTrackstarConnections: jest.fn(),
}))

const mockUseGetStoreWorkflowsConfigurations = jest.mocked(
    useGetStoreWorkflowsConfigurations,
)
const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates,
)

const mockUseListTrackstarConnections = jest.mocked(useListTrackstarConnections)

jest.mock('@repo/feature-flags')
const mockUseFlag = jest.mocked(useFlag)

const { useAppContext } = require('pages/AppContext')
const mockUseAppContext = jest.mocked(useAppContext)

const {
    useAiAgentNavigation,
} = require('pages/aiAgent/hooks/useAiAgentNavigation')
const mockUseAiAgentNavigation = jest.mocked(useAiAgentNavigation)

const { usePlaygroundPanel } = require('pages/aiAgent/hooks/usePlaygroundPanel')
const mockUsePlaygroundPanel = jest.mocked(usePlaygroundPanel)

const mockStore = configureMockStore([thunk])

const MOCK_EMAIL_ADDRESS = 'test@mail.com'

const defaultState = {
    billing: fromJS(billingState),
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Email,
                name: 'My email integration',
                meta: {
                    address: MOCK_EMAIL_ADDRESS,
                },
            },
        ],
    }),
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    '1': { id: 1, name: 'help center 1', type: 'faq' },
                    '2': { id: 2, name: 'help center 2', type: 'faq' },
                },
            },
        },
    },
}

const queryClient = mockQueryClient()

const renderComponent = () =>
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider client={queryClient}>
                <ActionsViewContainer />
            </QueryClientProvider>
        </Provider>,
    )

describe('ActionsViewContainer', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockUseFlag.mockReturnValue(false)
        mockUseGetStoreWorkflowsConfigurations.mockReturnValue({
            data: [actionConfigurationFixture],
            isLoading: false,
        } as unknown as ReturnType<typeof useGetStoreWorkflowsConfigurations>)
        mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
            data: [],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)
        mockUseListTrackstarConnections.mockReturnValue({
            data: [],
            isLoading: false,
        } as unknown as ReturnType<typeof useListTrackstarConnections>)

        mockUseAppContext.mockReturnValue({
            setCollapsibleColumnChildren: jest.fn(),
            collapsibleColumnChildren: null,
            isCollapsibleColumnOpen: false,
            setIsCollapsibleColumnOpen: jest.fn(),
        })

        mockUseAiAgentNavigation.mockReturnValue({
            routes: {
                newAction: (templateId?: string) =>
                    `/app/ai-agent/shopify/test-shop/actions/new${templateId ? `?template_id=${templateId}` : ''}`,
                actions: '/app/ai-agent/shopify/test-shop/actions',
            },
            navigationItems: [],
        } as any)

        mockUsePlaygroundPanel.mockReturnValue({
            openPlayground: jest.fn(),
            closePlayground: jest.fn(),
        } as any)
    })

    it('should render guidance page with title "Support Actions"', () => {
        renderComponent()

        expect(screen.getByText(SUPPORT_ACTIONS)).toBeInTheDocument()
    })
})
