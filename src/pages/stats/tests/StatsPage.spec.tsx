import React, {ComponentProps, ComponentType} from 'react'
import {useParams} from 'react-router-dom'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {StatsPageContainer} from '../StatsPage'
import {renderWithRouter, RenderWithRouterParams} from '../../../utils/testing'
import {AccountFeature} from '../../../state/currentAccount/types'
import Paywall from '../../common/components/Paywall/Paywall'
import {RootState, StoreDispatch} from '../../../state/types'

jest.mock('moment-timezone', () => () => {
    const moment: (
        date: string
    ) => Record<string, unknown> = jest.requireActual('moment-timezone')

    return moment('2019-09-03')
})

jest.mock(
    '../../common/utils/withPaywall',
    () => () => (Component: ComponentType<any>) => () => {
        return <Component />
    }
)

const mockUseParams = useParams
jest.mock('../StatsComponent', () => () => {
    const {view} = mockUseParams<{view?: string}>()
    return <div>Stats Component: {view}</div>
})

jest.mock('../RevenueStats', () => () => <div>Revenue Stats Component</div>)
jest.mock('../../common/components/Paywall/Paywall', () => {
    return ({feature}: ComponentProps<typeof Paywall>) => (
        <div>Paywall for feature: {feature}</div>
    )
})

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('StatsPage', () => {
    const defaultState: Partial<RootState> = {
        currentAccount: fromJS({
            features: fromJS({
                [AccountFeature.SatisfactionSurveys]: true,
                [AccountFeature.RevenueStatistics]: true,
            }),
        }),
    }

    const minProps = {
        config: fromJS({}),
        globalFilters: fromJS({}),
        setStatsFilters: jest.fn(),
        resetStatsFilters: jest.fn(),
        userTimezone: 'America/Los_Angeles',
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    describe('testing default filters', () => {
        it('should ensure the default value', () => {
            renderWithRouter(
                <Provider store={mockStore(defaultState)}>
                    <StatsPageContainer
                        {...minProps}
                        userTimezone={undefined}
                    />
                </Provider>,
                {
                    path: '/:view',
                    route: `/satisfaction`,
                }
            )
            expect(minProps.setStatsFilters).toMatchSnapshot()
        })

        it("should ensure the default period is using user's timezone", () => {
            renderWithRouter(
                <Provider store={mockStore(defaultState)}>
                    <StatsPageContainer
                        {...minProps}
                        userTimezone="Europe/Paris"
                    />
                </Provider>,
                {
                    path: '/:view',
                    route: `/satisfaction`,
                }
            )
            expect(minProps.setStatsFilters).toMatchSnapshot()
        })
    })

    it('should ensure that on component unmount we reset the stats filters', () => {
        const {unmount} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <StatsPageContainer {...minProps} />
            </Provider>,
            {
                path: '/:view',
                route: `/satisfaction`,
            }
        )
        unmount()
        expect(minProps.resetStatsFilters).toHaveBeenCalled()
    })

    it('should render "Satisfaction" statistics', () => {
        const {container} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <StatsPageContainer {...minProps} />
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
            <Provider store={mockStore(defaultState)}>
                <StatsPageContainer
                    {...minProps}
                    globalFilters={fromJS({integrations: [1]})}
                />
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
            <Provider store={mockStore(defaultState)}>
                <StatsPageContainer {...minProps} globalFilters={null} />
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
            <Provider store={mockStore(defaultState)}>
                <StatsPageContainer
                    {...minProps}
                    globalFilters={fromJS({agents: [1, 2]})}
                />
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
                currentAccount: fromJS({
                    features: fromJS({
                        [AccountFeature.SatisfactionSurveys]: false,
                        [AccountFeature.RevenueStatistics]: true,
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
                currentAccount: fromJS({
                    features: fromJS({
                        [AccountFeature.SatisfactionSurveys]: true,
                        [AccountFeature.RevenueStatistics]: false,
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
                <StatsPageContainer {...minProps} />
            </Provider>,
            routerParams
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
