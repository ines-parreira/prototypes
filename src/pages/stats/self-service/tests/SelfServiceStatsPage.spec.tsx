import React from 'react'
import {act, render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import _noop from 'lodash/noop'

import _cloneDeep from 'lodash/cloneDeep'

import {RootState, StoreDispatch} from 'state/types'
import {flushPromises, renderWithRouter} from 'utils/testing'
import {AccountFeature} from 'state/currentAccount/types'
import {integrationsState} from 'fixtures/integrations'
import {
    SELF_SERVICE_ARTICLE_RECOMMENDATION_PERFORMANCE,
    SELF_SERVICE_OVERVIEW,
    SELF_SERVICE_QUICK_RESPONSE_PERFORMANCE,
    SELF_SERVICE_TOP_REPORTED_ISSUES,
    SELF_SERVICE_VOLUME_PER_FLOW,
} from 'config/stats'
import {
    selfServiceArticleRecommendationPerformance,
    selfServiceArticleRecommendationPerformanceNoData,
    selfServiceOverview,
    selfServiceOverviewNoData,
    selfServiceProductsWithMostIssuesAndReturnRequests,
    selfServiceProductsWithMostIssuesAndReturnRequestsNoData,
    selfServiceQuickResponsePerformance,
    selfServiceQuickResponsePerformanceNoData,
    selfServiceTopReportedIssues,
    selfServiceTopReportedIssuesNoData,
    selfServiceVolumePerFlow,
    selfServiceVolumePerFlowNoData,
} from 'fixtures/stats'
import {StatsFilters} from 'models/stat/types'
import {initialState as helpCenterInitialState} from 'state/entities/helpCenter/reducer'

import {billingState} from 'fixtures/billing'
import {
    starterHelpdeskPriceFeatures,
    starterHelpdeskPrice,
    products,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import {account} from 'fixtures/account'
import useStatResource from '../../useStatResource'
import SelfServiceStatsPage from '../SelfServiceStatsPage'

jest.mock('../../useStatResource')
jest.spyOn(Date, 'now').mockImplementation(() => 1487076708000)
jest.mock('models/selfServiceConfiguration/resources', () => ({
    fetchSelfServiceConfigurations: jest.fn(() => Promise.resolve([])),
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useStatResourceMock = useStatResource as jest.MockedFunction<
    typeof useStatResource
>

describe('<SelfServiceStatsPage />', () => {
    const defaultState = {
        stats: fromJS({
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                integrations: [integrationsState.integrations[0].id],
            } as StatsFilters,
        }),
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
        entities: {
            macros: {},
            rules: {},
            ruleRecipes: {},
            sections: {},
            stats: {},
            tags: {},
            views: {},
            viewsCount: {},
            helpCenter: helpCenterInitialState,
            helpCenterArticles: {},
            selfServiceConfigurations: {},
            phoneNumbers: {},
            auditLogEvents: {},
        } as RootState['entities'],
        integrations: fromJS({integrations: []}),
        billing: fromJS(billingState),
    } as RootState

    beforeEach(() => {
        useStatResourceMock.mockReturnValue([null, true, _noop])
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should display the loader on loading', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <SelfServiceStatsPage />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should render the automation add-on upgrade paywall if the current account doesnt have the feature', () => {
        const productsWithStarterPrice = _cloneDeep(products)
        productsWithStarterPrice[0].prices.push(starterHelpdeskPrice)

        act(() => {
            const {container} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        currentAccount: fromJS({
                            current_subscription: {
                                products: {
                                    [HELPDESK_PRODUCT_ID]:
                                        starterHelpdeskPrice.price_id,
                                },
                            },
                            features: starterHelpdeskPriceFeatures,
                        }),
                        billing: fromJS({
                            ...billingState,
                            products: productsWithStarterPrice,
                        }),
                    })}
                >
                    <SelfServiceStatsPage />
                </Provider>
            )
            expect(container).toMatchSnapshot()
        })
    })

    it('should render the filters and stats when stats filters are defined', async () => {
        useStatResourceMock.mockImplementation(({resourceName}) => {
            if (resourceName === SELF_SERVICE_OVERVIEW) {
                return [selfServiceOverview, false, _noop]
            } else if (resourceName === SELF_SERVICE_VOLUME_PER_FLOW) {
                return [selfServiceVolumePerFlow, false, _noop]
            } else if (
                resourceName === SELF_SERVICE_QUICK_RESPONSE_PERFORMANCE
            ) {
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

        const {container, getByText} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <SelfServiceStatsPage />
            </Provider>
        )

        await flushPromises()

        expect(getByText(/Self-service volume per flow/)).toBeTruthy()
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the stats with the feature preview when there is no data and the features are disabled', async () => {
        useStatResourceMock.mockImplementation(({resourceName}) => {
            if (resourceName === SELF_SERVICE_OVERVIEW) {
                return [selfServiceOverviewNoData, false, _noop]
            } else if (resourceName === SELF_SERVICE_VOLUME_PER_FLOW) {
                return [selfServiceVolumePerFlowNoData, false, _noop]
            } else if (
                resourceName === SELF_SERVICE_QUICK_RESPONSE_PERFORMANCE
            ) {
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
            <Provider store={mockStore(defaultState)}>
                <SelfServiceStatsPage />
            </Provider>
        )

        await flushPromises()

        expect(
            getByText(
                /There is no Self-service activity. Your Chat or Help Center may not be properly installed./
            )
        ).toBeTruthy()
        expect(container.firstChild).toMatchSnapshot()
    })
})
