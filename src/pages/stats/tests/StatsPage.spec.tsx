import React, {ComponentProps} from 'react'
import {useParams} from 'react-router-dom'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import StatsPage from '../StatsPage'
import {renderWithRouter, RenderWithRouterParams} from '../../../utils/testing'
import {AccountFeature} from '../../../state/currentAccount/types'
import Paywall from '../../common/components/Paywall/Paywall'
import {RootState, StoreDispatch} from '../../../state/types'
import {
    integrationsState,
    integrationsStateWithShopify,
} from '../../../fixtures/integrations'
import {user} from '../../../fixtures/users'

jest.mock('moment-timezone', () => () => {
    const moment: (
        date: string
    ) => Record<string, unknown> = jest.requireActual('moment-timezone')

    return moment('2019-09-03')
})

const mockUseParams = useParams
jest.mock('../Stats', () => () => {
    const {view} = mockUseParams<{view?: string}>()
    return <div>Stats Component: {view}</div>
})

jest.mock('../StatsFilters', () => () => 'StatsFilters')

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
            features: fromJS({
                [AccountFeature.SatisfactionSurveys]: {enabled: true},
                [AccountFeature.RevenueStatistics]: {enabled: true},
            }),
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

    describe('testing default filters', () => {
        it('should ensure the default value', () => {
            const store = mockStore({
                ...defaultState,
                currentUser: defaultState.currentUser!.set(
                    'timezone',
                    undefined
                ),
            })

            renderWithRouter(
                <Provider store={store}>
                    <StatsPage />
                </Provider>,
                {
                    path: '/:view',
                    route: `/satisfaction`,
                }
            )

            expect(store.getActions()).toMatchSnapshot()
        })

        it("should ensure the default period is using user's timezone", () => {
            const store = mockStore({
                ...defaultState,
                currentUser: defaultState.currentUser!.set(
                    'timezone',
                    'Europe/Paris'
                ),
            })

            renderWithRouter(
                <Provider store={store}>
                    <StatsPage />
                </Provider>,
                {
                    path: '/:view',
                    route: `/satisfaction`,
                }
            )

            expect(store.getActions()).toMatchSnapshot()
        })
    })

    it('should ensure that on component unmount we reset the stats filters', () => {
        const store = mockStore(defaultState)

        const {unmount} = renderWithRouter(
            <Provider store={store}>
                <StatsPage />
            </Provider>,
            {
                path: '/:view',
                route: `/satisfaction`,
            }
        )
        unmount()

        expect(store.getActions()).toMatchSnapshot()
    })

    it('should render "Satisfaction" statistics', () => {
        const {container} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <StatsPage />
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
                <StatsPage />
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
                <StatsPage />
            </Provider>,
            {
                path: '/:view',
                route: `/overview`,
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
                <StatsPage />
            </Provider>,
            {
                path: '/:view',
                route: `/overview`,
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
    ])('should render paywall when %s', (testName, state, routerParams) => {
        const {container} = renderWithRouter(
            <Provider store={mockStore(state)}>
                <StatsPage />
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
                <StatsPage />
            </Provider>,
            {
                path: '/:view',
                route: `/revenue`,
            }
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
