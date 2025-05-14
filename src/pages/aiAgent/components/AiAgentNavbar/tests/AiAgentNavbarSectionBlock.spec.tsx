import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'

import '@testing-library/jest-dom/extend-expect'

import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { appQueryClient } from 'api/queryClient'
import { account } from 'fixtures/account'
import { IntegrationType } from 'models/integration/constants'
import { ShopType } from 'models/selfServiceConfiguration/types'
import { AiAgentNavbarSectionBlock } from 'pages/aiAgent/components/AiAgentNavbar/AiAgentNavbarSectionBlock'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import {
    OnboardingState,
    useAiAgentOnboardingState,
} from 'pages/aiAgent/hooks/useAiAgentOnboardingState'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import {
    getAiSalesAgentTrialState,
    TrialState,
} from 'pages/aiAgent/utils/aiSalesAgentTrialUtils'
import { useReportChartRestrictions } from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import { assumeMock, renderWithRouter } from 'utils/testing'

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')
jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingState')
jest.mock('pages/aiAgent/utils/aiSalesAgentTrialUtils')
jest.mock('pages/aiAgent/hooks/useStoreConfiguration')

const mockUseAiAgentNavigation = assumeMock(useAiAgentNavigation)
const mockUseAiAgentOnboardingState = assumeMock(useAiAgentOnboardingState)
const mockGetAiAgentTrialState = assumeMock(getAiSalesAgentTrialState)
const useStoreConfigurationMock = assumeMock(useStoreConfiguration)

jest.mock(
    'pages/stats/report-chart-restrictions/useReportChartRestrictions',
    () => ({
        useReportChartRestrictions: jest.fn(),
    }),
)
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

const mockStore = configureMockStore([thunk])
const defaultStoreConfiguration = getStoreConfigurationFixture()
const MOCK_EMAIL_ADDRESS = 'test@mail.com'

const defaultState = {
    currentAccount: fromJS(account),
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

const defaultProps = {
    shopType: IntegrationType.Shopify as ShopType,
    shopName: 'Test Shop',
    onToggle: jest.fn(),
    name: 'Test Name',
    isExpanded: true,
}

const renderComponent = () => {
    const { container } = renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider client={appQueryClient}>
                <AiAgentNavbarSectionBlock {...defaultProps} />
            </QueryClientProvider>
        </Provider>,
    )

    return { container }
}

describe('AiAgentNavbarSectionBlock', () => {
    beforeEach(() => {
        useStoreConfigurationMock.mockReturnValue({
            isLoading: false,
            storeConfiguration: defaultStoreConfiguration,
            isFetched: true,
            error: null,
        })
        mockUseAiAgentNavigation.mockReturnValue({
            // @ts-ignore We don't test this part
            routes: { main: '/main' },
            navigationItems: [
                { route: '/route1', title: 'Route 1', dataCanduId: 'candu-1' },
                { route: '/route2', title: 'Route 2' },
                { route: '/route3', title: 'Shopping Assistant' },
            ],
        })
        mockUseAiAgentOnboardingState.mockReturnValue(OnboardingState.Onboarded)
        useReportChartRestrictionsMock.mockReturnValue({
            isRouteRestrictedToCurrentUser: () => false,
        } as any)
        mockGetAiAgentTrialState.mockReturnValue(TrialState.NotTrial)
    })

    test('renders the component with onboarded state', () => {
        renderComponent()

        expect(screen.getByAltText('shopify logo')).toBeInTheDocument()
        expect(screen.getByText('Route 1')).toBeInTheDocument()
        expect(screen.getByText('Route 2')).toBeInTheDocument()
        expect(screen.getByText('Shopping Assistant')).toBeInTheDocument()
        expect(screen.queryByText('Get Started')).not.toBeInTheDocument()
    })

    test('renders the component with non-onboarded state', () => {
        mockUseAiAgentOnboardingState.mockReturnValueOnce(
            OnboardingState.OnboardingWizard,
        )

        renderComponent()

        expect(screen.getByAltText('shopify logo')).toBeInTheDocument()
        expect(screen.getByText('Get Started')).toBeInTheDocument()
        expect(screen.queryByText('Route 1')).not.toBeInTheDocument()
        expect(screen.queryByText('Route 2')).not.toBeInTheDocument()
        expect(screen.queryByText('Sales')).not.toBeInTheDocument()
    })

    test('does not render the sub-menu when loading', () => {
        mockUseAiAgentOnboardingState.mockReturnValueOnce(
            OnboardingState.Loading,
        )

        renderComponent()

        expect(screen.queryByText('Get Started')).not.toBeInTheDocument()
        expect(screen.queryByText('Route 1')).not.toBeInTheDocument()
        expect(screen.queryByText('Route 2')).not.toBeInTheDocument()
        expect(screen.queryByText('Sales')).not.toBeInTheDocument()
    })

    test('does not render the BETA badge when there is no Sales route', () => {
        mockUseAiAgentNavigation.mockReturnValue({
            // @ts-ignore We don't test this part
            routes: { main: '/main' },
            navigationItems: [
                { route: '/route1', title: 'Route 1', dataCanduId: 'candu-1' },
                { route: '/route2', title: 'Route 2' },
            ],
        })

        renderComponent()

        expect(screen.queryByText('BETA')).not.toBeInTheDocument()
    })

    test('does not render TRIAL badge for Sales item when not in trial mode', () => {
        mockUseAiAgentNavigation.mockReturnValue({
            // @ts-ignore We don't test this part
            routes: { main: '/main' },
            navigationItems: [
                { route: '/route1', title: 'Route 1' },
                { route: '/route2', title: 'Route 2' },
                { route: '/route3', title: 'Shopping Assistant' },
            ],
        })
        renderComponent()

        expect(screen.getByText('Shopping Assistant')).toBeInTheDocument()
        expect(screen.queryByText('TRIAL')).not.toBeInTheDocument()
    })

    test('renders TRIAL badge for Sales item when in trial mode', () => {
        mockUseAiAgentNavigation.mockReturnValue({
            // @ts-ignore We don't test this part
            routes: { main: '/main' },
            navigationItems: [
                { route: '/route1', title: 'Route 1' },
                { route: '/route2', title: 'Route 2' },
                { route: '/route3', title: 'Shopping Assistant' },
            ],
        })
        mockGetAiAgentTrialState.mockReturnValue(TrialState.Trial)

        renderComponent()

        expect(screen.getByText('Shopping Assistant')).toBeInTheDocument()
        expect(screen.getByText('TRIAL')).toBeInTheDocument()
    })
})
