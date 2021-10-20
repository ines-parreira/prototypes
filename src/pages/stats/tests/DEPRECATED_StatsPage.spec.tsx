import React, {ComponentProps} from 'react'
import {useParams} from 'react-router-dom'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {account} from '../../../fixtures/account'
import DEPRECATED_StatsPage from '../DEPRECATED_StatsPage'
import {renderWithRouter, RenderWithRouterParams} from '../../../utils/testing'
import {AccountFeature} from '../../../state/currentAccount/types'
import Paywall from '../../common/components/Paywall/Paywall'
import {RootState, StoreDispatch} from '../../../state/types'
import {
    integrationsState,
    integrationsStateWithShopify,
} from '../../../fixtures/integrations'
import {user} from '../../../fixtures/users'

const mockUseParams = useParams
jest.mock('../DEPRECATED_Stats', () => () => {
    const {view} = mockUseParams<{view?: string}>()
    return <div>Stats Component: {view}</div>
})

jest.mock('../DEPRECATED_StatsFilters', () => () => 'StatsFilters')

jest.mock('../../common/components/Paywall/Paywall', () => {
    return ({feature}: ComponentProps<typeof Paywall>) => (
        <div>Paywall for feature: {feature}</div>
    )
})

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('StatsPage', () => {
    const defaultState: Partial<RootState> = {
        integrations: fromJS(integrationsStateWithShopify),
        currentAccount: fromJS({
            features: fromJS(account.features),
        }),
        currentUser: fromJS({
            ...user,
            timezone: 'America/Los_Angeles',
        }),
        stats: fromJS({
            filters: fromJS({}),
        }),
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render "Satisfaction" statistics', () => {
        const {container} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <DEPRECATED_StatsPage />
            </Provider>,
            {
                path: '/:view',
                route: `/satisfaction`,
            }
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render "Revenue" statistics', () => {
        const {container} = renderWithRouter(
            <Provider
                store={mockStore({
                    ...defaultState,
                    stats: defaultState.stats!.set(
                        'filters',
                        fromJS({integrations: [1]})
                    ),
                })}
            >
                <DEPRECATED_StatsPage />
            </Provider>,
            {
                path: '/:view',
                route: `/revenue`,
            }
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render statistics because there is no filter', () => {
        const {container} = renderWithRouter(
            <Provider
                store={mockStore({
                    ...defaultState,
                    stats: defaultState.stats!.set('filters', null),
                })}
            >
                <DEPRECATED_StatsPage />
            </Provider>,
            {
                path: '/:view',
                route: `/support-performance-overview`,
            }
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render "Overview" statistics', () => {
        const {container} = renderWithRouter(
            <Provider
                store={mockStore({
                    ...defaultState,
                    stats: defaultState.stats!.set(
                        'filters',
                        fromJS({agents: [1, 2]})
                    ),
                })}
            >
                <DEPRECATED_StatsPage />
            </Provider>,
            {
                path: '/:view',
                route: `/support-performance-overview`,
            }
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it.each<[string, typeof defaultState, RenderWithRouterParams]>([
        [
            'on statistics page and the satisfaction surveys feature is not available',
            {
                ...defaultState,
                currentAccount: fromJS({
                    features: fromJS({
                        ...account.features,
                        [AccountFeature.SatisfactionSurveys]: {enabled: false},
                        [AccountFeature.RevenueStatistics]: {enabled: true},
                    }),
                }),
            },
            {
                path: '/:view',
                route: `/satisfaction`,
            },
        ],
        [
            'on revenue page and the revenue statistics feature is not available',
            {
                ...defaultState,
                currentAccount: fromJS({
                    features: fromJS({
                        ...account.features,
                        [AccountFeature.SatisfactionSurveys]: {enabled: true},
                        [AccountFeature.RevenueStatistics]: {enabled: false},
                    }),
                }),
            },
            {
                path: '/:view',
                route: `/revenue`,
            },
        ],
        [
            'on live overview page and the live overview feature is not available',
            {
                ...defaultState,
                currentAccount: fromJS({
                    features: fromJS({
                        ...account.features,
                        [AccountFeature.OverviewLiveStatistics]: {
                            enabled: false,
                        },
                    }),
                }),
            },
            {
                path: '/:view',
                route: `/live-overview`,
            },
        ],
        [
            'on live agents page and the live agents feature is not available',
            {
                ...defaultState,
                currentAccount: fromJS({
                    features: fromJS({
                        ...account.features,
                        [AccountFeature.UsersLiveStatistics]: {enabled: false},
                    }),
                }),
            },
            {
                path: '/:view',
                route: `/live-agents`,
            },
        ],
    ])('should render paywall when %s', (testName, state, routerParams) => {
        const {container} = renderWithRouter(
            <Provider store={mockStore(state)}>
                <DEPRECATED_StatsPage />
            </Provider>,
            routerParams
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should restrict feature when on revenue statistics page and integrations are missing', () => {
        const {container} = renderWithRouter(
            <Provider
                store={mockStore({
                    ...defaultState,
                    integrations: fromJS(integrationsState),
                })}
            >
                <DEPRECATED_StatsPage />
            </Provider>,
            {
                path: '/:view',
                route: `/revenue`,
            }
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render NoMatch component when an unmatched path is accessed', () => {
        const store = mockStore(defaultState)

        const {container} = renderWithRouter(
            <Provider store={store}>
                <DEPRECATED_StatsPage />
            </Provider>,
            {
                path: '/:view',
                route: `/foo`,
            }
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
