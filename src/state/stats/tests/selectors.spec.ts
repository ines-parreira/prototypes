import {fromJS} from 'immutable'

import {EMAIL_CHANNEL} from '../../../config/ticket'
import {
    GMAIL_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from '../../../constants/integration'
import {RootState} from '../../types'
import {initialState} from '../reducers'
import * as selectors from '../selectors'
import {
    getMessagingIntegrationsStatsFilter,
    getStatsFiltersJS,
    getStatsMessagingIntegrations,
    getStatsStoreIntegrations,
    getStoreIntegrationsStatsFilter,
} from '../selectors'
import {StatsFilters, StatsFilterType} from '../types'
import {TicketChannel} from '../../../business/types/ticket'
import {IntegrationType} from '../../../models/integration/constants'

jest.mock('moment-timezone', () => () => {
    const moment: (date: string) => Record<string, unknown> =
        jest.requireActual('moment-timezone')

    return moment('2019-09-03')
})

describe('selectors', () => {
    describe('stats', () => {
        let defaultState: RootState
        const defaultStatsFilters = {
            [StatsFilterType.Period]: {start_datetime: '0', end_datetime: '0'},
        } as StatsFilters

        beforeEach(() => {
            defaultState = {
                stats: initialState,
            } as RootState
        })

        describe('getStatsState()', () => {
            it('should return the whole `stats` state', () => {
                expect(selectors.getStatsState(defaultState)).toEqual(
                    defaultState.stats
                )
            })
        })

        describe('getFilters()', () => {
            it('should return existing filters', () => {
                const filters = fromJS({tags: [1, 2]})
                defaultState.stats = defaultState.stats.set('filters', filters)
                expect(selectors.getFilters(defaultState)).toEqual(filters)

                defaultState.stats = defaultState.stats.set('filters', null)
                expect(selectors.getFilters(defaultState)).toEqual(null)
            })
        })

        describe('getViewfilters()', () => {
            it('should return no filter for the given view because there is no filter', () => {
                defaultState.stats = defaultState.stats.set('filters', null)
                expect(
                    selectors.DEPRECATED_makeStatsFiltersSelector(
                        'support-performance-overview'
                    )(defaultState)
                ).toEqual(null)
            })

            it('should return filters for the given view', () => {
                const filters = fromJS({
                    tags: [1, 2],
                    agents: [234, 654],
                    score: '4',
                    channels: [EMAIL_CHANNEL],
                    period: {
                        start_datetime: '2019-03-09',
                        end_datetime: '2019-03-10',
                    },
                })
                defaultState.stats = defaultState.stats.set('filters', filters)
                expect(
                    selectors.DEPRECATED_makeStatsFiltersSelector(
                        'support-performance-overview'
                    )(defaultState)
                ).toMatchSnapshot()
                expect(
                    selectors.DEPRECATED_makeStatsFiltersSelector(
                        'satisfaction'
                    )(defaultState)
                ).toMatchSnapshot()
            })

            it('should remove integrations when they are not allowed in filters', () => {
                defaultState.stats = defaultState.stats.set(
                    'filters',
                    fromJS({
                        integrations: [1, 2],
                        period: {
                            start_datetime: '2019-03-09',
                            end_datetime: '2019-03-10',
                        },
                    })
                )
                defaultState.integrations = defaultState.stats.set(
                    'integrations',
                    fromJS([
                        {
                            id: 1,
                            type: SHOPIFY_INTEGRATION_TYPE,
                        },
                        {
                            id: 2,
                            type: GMAIL_INTEGRATION_TYPE,
                        },
                    ])
                )

                expect(
                    selectors.DEPRECATED_makeStatsFiltersSelector('revenue')(
                        defaultState
                    )
                ).toMatchSnapshot()
            })

            it("should add an integration in the filters because it's a required field", () => {
                defaultState.stats = defaultState.stats.set(
                    'filters',
                    fromJS({
                        integrations: [],
                        period: {
                            start_datetime: '2019-03-09',
                            end_datetime: '2019-03-10',
                        },
                    })
                )
                defaultState.integrations = defaultState.stats.set(
                    'integrations',
                    fromJS([
                        {
                            id: 1,
                            type: GMAIL_INTEGRATION_TYPE,
                        },
                        {
                            id: 2,
                            type: SHOPIFY_INTEGRATION_TYPE,
                        },
                    ])
                )

                expect(
                    selectors.DEPRECATED_makeStatsFiltersSelector('revenue')(
                        defaultState
                    )
                ).toMatchSnapshot()
            })

            it('should return a default period if missing from the filters', () => {
                defaultState.stats = defaultState.stats.set(
                    'filters',
                    fromJS({})
                )
                expect(
                    selectors.DEPRECATED_makeStatsFiltersSelector(
                        'live-agents'
                    )(defaultState)
                ).toMatchSnapshot()
            })
        })

        describe('getStatsFiltersJS', () => {
            it('should return null when stats filters are null', () => {
                expect(getStatsFiltersJS(defaultState)).toBe(null)
            })

            it('should return filters object when stats filters are set', () => {
                const statFilters: StatsFilters = {
                    ...defaultStatsFilters,
                    integrations: [1],
                }
                const state = {
                    ...defaultState,
                    stats: defaultState.stats.set(
                        'filters',
                        fromJS(statFilters)
                    ),
                }
                expect(getStatsFiltersJS(state)).toEqual(statFilters)
            })
        })

        describe.each([
            [
                'getStatsMessagingIntegrations',
                'message',
                getStatsMessagingIntegrations,
            ],

            ['getStatsStoreIntegrations', 'store', getStatsStoreIntegrations],
        ])('%s', (testName, integrationType, selector) => {
            it('should return an empty array when integrations are not set', () => {
                expect(selector(defaultState)).toEqual([])
            })

            it(`should return only ${integrationType} integrations`, () => {
                const state = {
                    ...defaultState,
                    integrations: fromJS({
                        integrations: [
                            {
                                id: 1,
                                type: IntegrationType.Gmail,
                            },
                            {
                                id: 2,
                                type: IntegrationType.Shopify,
                            },
                        ],
                    }),
                }
                expect(selector(state)).toMatchSnapshot()
            })
        })

        describe.each([
            [
                'getMessagingIntegrationsStatsFilter',
                'message',
                getMessagingIntegrationsStatsFilter,
            ],
            [
                'getStoreIntegrationsStatsFilter',
                'store',
                getStoreIntegrationsStatsFilter,
            ],
        ])('%s', (testName, integrationType, selector) => {
            it('should return an empty array when the stat filters are not set', () => {
                expect(selector(defaultState)).toEqual([])
            })

            it('should return an empty array when the integrations stat filter is not set', () => {
                const state: RootState = {
                    ...defaultState,
                    stats: defaultState.stats.set(
                        'filters',
                        fromJS({
                            ...defaultStatsFilters,
                            channels: [TicketChannel.Email],
                        })
                    ),
                }
                expect(selector(state)).toEqual([])
            })

            it(`should return only ${integrationType} integrations`, () => {
                const state = {
                    ...defaultState,
                    stats: defaultState.stats.set(
                        'filters',
                        fromJS({
                            ...defaultStatsFilters,
                            integrations: [1, 2, 3],
                        })
                    ),
                    integrations: fromJS({
                        integrations: [
                            {
                                id: 1,
                                type: IntegrationType.Gmail,
                            },
                            {
                                id: 2,
                                type: IntegrationType.Shopify,
                            },
                        ],
                    }),
                }
                expect(selector(state)).toMatchSnapshot()
            })
        })
    })
})
