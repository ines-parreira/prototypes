import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { billingState } from 'fixtures/billing'
import { selfServiceConfiguration1 } from 'fixtures/self_service_configurations'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import { useHelpCenterList } from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import ArticleRecommendationViewContainer from '../ArticleRecommendationViewContainer'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterList')
jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')
jest.mock('launchdarkly-react-client-sdk')

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const defaultState = {
    billing: fromJS(billingState),
    integrations: fromJS({
        integrations: [
            { type: 'email', meta: { address: 'test@gorgias.com' } },
        ],
    }),
    entities: {
        chatsApplicationAutomationSettings: {},
    },
} as RootState

describe('<ArticleRecommendationPreview />', () => {
    beforeEach(() => {
        ;(
            useHelpCenterList as jest.MockedFn<typeof useHelpCenterList>
        ).mockReturnValue({
            helpCenters: [],
            isLoading: false,
            fetchMore: jest.fn(),
            hasMore: false,
        })
        ;(
            useSelfServiceConfiguration as jest.MockedFn<
                typeof useSelfServiceConfiguration
            >
        ).mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                articleRecommendationHelpCenterId: 1,
            },
            handleSelfServiceConfigurationUpdate: () => Promise.resolve(),
        })
    })

    it('should display the new paywall', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider
                    store={mockStore({
                        ...defaultState,
                    })}
                >
                    <ArticleRecommendationViewContainer />
                </Provider>
            </QueryClientProvider>,
            {
                path: `/app/automation/:shopType/:shopName/article-recommendation`,
                route: '/app/automation/shopify/test-shop/article-recommendation',
            },
        )
        expect(screen.getByText(/Introducing AI Agent /)).toBeInTheDocument()
    })
})
