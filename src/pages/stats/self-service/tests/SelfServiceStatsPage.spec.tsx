import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import _noop from 'lodash/noop'

import LD from 'launchdarkly-react-client-sdk'
import {QueryClientProvider} from '@tanstack/react-query'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {flushPromises, renderWithRouter} from 'utils/testing'
import {AccountFeature} from 'state/currentAccount/types'
import {integrationsState} from 'fixtures/integrations'
import {
    SELF_SERVICE_ARTICLE_RECOMMENDATION_PERFORMANCE,
    SELF_SERVICE_QUICK_RESPONSE_PERFORMANCE,
    SELF_SERVICE_TOP_REPORTED_ISSUES,
} from 'config/stats'
import {
    selfServiceArticleRecommendationPerformance,
    selfServiceArticleRecommendationPerformanceNoData,
    selfServiceProductsWithMostIssuesAndReturnRequests,
    selfServiceProductsWithMostIssuesAndReturnRequestsNoData,
    selfServiceQuickResponsePerformance,
    selfServiceQuickResponsePerformanceNoData,
    selfServiceTopReportedIssues,
    selfServiceTopReportedIssuesNoData,
} from 'fixtures/stats'
import {StatsFilters} from 'models/stat/types'

import {billingState} from 'fixtures/billing'
import {account} from 'fixtures/account'
import {entitiesInitialState} from 'fixtures/entities'
import {IntegrationType} from 'models/integration/constants'
import useStatResource from 'hooks/reporting/useStatResource'
import SelfServiceStatsPage from 'pages/stats/self-service/SelfServiceStatsPage'
import {FeatureFlagKey} from 'config/featureFlags'
import {useGetWorkflowConfigurations} from 'models/workflows/queries'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'

const mockSelfServiceConfigurations = [
    {
        id: 1,
        type: 'shopify' as const,
        shopName: `mystore`,
        createdDatetime: '2021-01-26T00:29:00Z',
        updatedDatetime: '2021-01-26T00:29:30Z',
        deactivatedDatetime: null,
        reportIssuePolicy: {
            enabled: false,
            cases: [],
        },
        trackOrderPolicy: {
            enabled: false,
        },
        cancelOrderPolicy: {
            enabled: false,
            eligibilities: [],
            exceptions: [],
        },
        returnOrderPolicy: {
            enabled: false,
            eligibilities: [],
            exceptions: [],
        },
        quickResponsePolicies: [],
        articleRecommendationHelpCenterId: null,
    },
]

jest.mock('hooks/reporting/useStatResource')
jest.spyOn(Date, 'now').mockImplementation(() => 1487076708000)
jest.mock('models/selfServiceConfiguration/queries', () => ({
    useGetSelfServiceConfigurations: jest.fn(() => ({
        data: mockSelfServiceConfigurations,
        isLoading: false,
    })),
}))

jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))

jest.mock('pages/settings/helpCenter/queries', () => ({
    useGetAIArticles: jest.fn(() => ({
        data: [],
        isLoading: false,
    })),
}))
jest.mock('models/workflows/queries', () => ({
    useGetWorkflowConfigurations: jest.fn(),
}))
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useStatResourceMock = useStatResource as jest.MockedFunction<
    typeof useStatResource
>
const mockedUseWorkflowConfigurations = jest.mocked(
    useGetWorkflowConfigurations
)

const mockClient = mockQueryClient()

describe('<SelfServiceStatsPage />', () => {
    function getIntegration(id: number, type: IntegrationType) {
        return {
            id,
            type,
            name: `My Phone Integration ${id}`,
            meta: {
                emoji: '',
                phone_number_id: id,
            },
        }
    }
    const defaultState = {
        stats: {
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                integrations: [integrationsState.integrations[0].id],
            } as StatsFilters,
        },
        currentAccount: fromJS({
            features: {
                [AccountFeature.AutomationReturnFlow]: {enabled: true},
                [AccountFeature.AutomationCancellationsFlow]: {enabled: true},
                [AccountFeature.AutomationTrackOrderFlow]: {enabled: true},
                [AccountFeature.AutomationReportIssueFlow]: {enabled: true},
                [AccountFeature.AutomationSelfServiceStatistics]: {
                    enabled: true,
                },
            },
            created_datetime: '2021-08-01T00:00:00Z',
            current_subscription: account.current_subscription,
        }),
        entities: entitiesInitialState,
        integrations: fromJS({
            integrations: [
                getIntegration(1, IntegrationType.Shopify),
                getIntegration(2, IntegrationType.Magento2),
            ],
        }),
        billing: fromJS(billingState),
        ui: {
            stats: uiStatsInitialState,
        },
    } as RootState

    beforeEach(() => {
        useStatResourceMock.mockReturnValue([null, true, _noop])
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.NewDatePickerVariant]: false,
        }))
        mockedUseWorkflowConfigurations.mockReturnValue({
            isLoading: false,
            data: [],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)
    })

    it('should display the loader on loading', () => {
        const {container} = render(
            <QueryClientProvider client={mockClient}>
                <Provider store={mockStore(defaultState)}>
                    <SelfServiceStatsPage />
                </Provider>
            </QueryClientProvider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should render the filters and stats when stats filters are defined', async () => {
        useStatResourceMock.mockImplementation(({resourceName}) => {
            if (resourceName === SELF_SERVICE_QUICK_RESPONSE_PERFORMANCE) {
                return [selfServiceQuickResponsePerformance, false, _noop]
            } else if (
                resourceName === SELF_SERVICE_ARTICLE_RECOMMENDATION_PERFORMANCE
            ) {
                return [
                    selfServiceArticleRecommendationPerformance,
                    false,
                    _noop,
                ]
            } else if (resourceName === SELF_SERVICE_TOP_REPORTED_ISSUES) {
                return [selfServiceTopReportedIssues, false, _noop]
            }
            return [
                selfServiceProductsWithMostIssuesAndReturnRequests,
                false,
                _noop,
            ]
        })

        const {container} = renderWithRouter(
            <QueryClientProvider client={mockClient}>
                <Provider store={mockStore(defaultState)}>
                    <SelfServiceStatsPage />
                </Provider>
            </QueryClientProvider>
        )

        await flushPromises()

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the stats with the feature preview when there is no data and the features are disabled', async () => {
        useStatResourceMock.mockImplementation(({resourceName}) => {
            if (resourceName === SELF_SERVICE_QUICK_RESPONSE_PERFORMANCE) {
                return [selfServiceQuickResponsePerformanceNoData, false, _noop]
            } else if (
                resourceName === SELF_SERVICE_ARTICLE_RECOMMENDATION_PERFORMANCE
            ) {
                return [
                    selfServiceArticleRecommendationPerformanceNoData,
                    false,
                    _noop,
                ]
            } else if (resourceName === SELF_SERVICE_TOP_REPORTED_ISSUES) {
                return [selfServiceTopReportedIssuesNoData, false, _noop]
            }
            return [
                selfServiceProductsWithMostIssuesAndReturnRequestsNoData,
                false,
                _noop,
            ]
        })

        const {container, getByText} = renderWithRouter(
            <QueryClientProvider client={mockClient}>
                <Provider store={mockStore(defaultState)}>
                    <SelfServiceStatsPage />
                </Provider>
            </QueryClientProvider>
        )

        await flushPromises()

        expect(
            getByText(
                /There is no activity for these features. Your chat or help center may not be properly installed./
            )
        ).toBeTruthy()
        expect(container.firstChild).toMatchSnapshot()
    })
})
