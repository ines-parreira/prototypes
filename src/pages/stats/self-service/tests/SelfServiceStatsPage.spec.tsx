import React from 'react'
import {act, render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import _noop from 'lodash/noop'

import {RootState, StoreDispatch} from 'state/types'
import {proPlan} from 'fixtures/subscriptionPlan'
import {flushPromises, renderWithRouter} from 'utils/testing'
import {AccountFeature} from 'state/currentAccount/types'
import {integrationsState} from 'fixtures/integrations'
import {
    SELF_SERVICE_FLOWS_DISTRIBUTION,
    SELF_SERVICE_OVERVIEW,
    SELF_SERVICE_PRODUCTS_WITH_MOST_ISSUES,
    SELF_SERVICE_TOP_REPORTED_ISSUES,
} from 'config/stats'
import {
    selfServiceFlowsDistribution,
    selfServiceMostReturnedProducts,
    selfServiceOverview,
    selfServiceProductsWithMostIssues,
    selfServiceTopReportedIssues,
} from 'fixtures/stats'
import {StatsFilters} from 'models/stat/types'
import {initialState as helpCenterInitialState} from 'state/entities/helpCenter/reducer'

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
        integrations: fromJS({}),
        billing: fromJS({plans: []}),
    } as RootState

    beforeEach(() => {
        useStatResourceMock.mockReturnValue([null, true, _noop])
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should display the loader on loading', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        current_subscription: fromJS({
                            plan: proPlan.id,
                        }),
                        features: {
                            ...proPlan.features,
                        },
                    }),
                })}
            >
                <SelfServiceStatsPage />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should render the automation add-on upgrade paywall if the current account doesnt have the feature', () => {
        act(() => {
            const {container} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        currentAccount: fromJS({
                            current_subscription: fromJS({
                                plan: proPlan.id,
                            }),
                            features: {
                                ...proPlan.features,
                            },
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
            } else if (resourceName === SELF_SERVICE_FLOWS_DISTRIBUTION) {
                return [selfServiceFlowsDistribution, false, _noop]
            } else if (
                resourceName === SELF_SERVICE_PRODUCTS_WITH_MOST_ISSUES
            ) {
                return [selfServiceProductsWithMostIssues, false, _noop]
            } else if (resourceName === SELF_SERVICE_TOP_REPORTED_ISSUES) {
                return [selfServiceTopReportedIssues, false, _noop]
            }
            return [selfServiceMostReturnedProducts, false, _noop]
        })

        const {container} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <SelfServiceStatsPage />
            </Provider>
        )

        await flushPromises()

        expect(container.firstChild).toMatchSnapshot()
    })
})
