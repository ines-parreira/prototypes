import {fromJS} from 'immutable'

import {initialState} from '../reducers.ts'
import * as selectors from '../selectors.ts'
import {EMAIL_CHANNEL} from '../../../config/ticket.ts'
import {
    GMAIL_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from '../../../constants/integration.ts'

jest.mock('moment-timezone', () => () => {
    const moment = jest.requireActual('moment-timezone')

    return moment('2019-09-03')
})

describe('selectors', () => {
    describe('stats', () => {
        let state = null

        beforeEach(() => {
            state = {
                stats: initialState,
            }
        })

        describe('getStatsState()', () => {
            it('should return the whole `stats` state, or an empty Map', () => {
                expect(selectors.getStatsState(state)).toEqual(state.stats)
            })
        })

        describe('getFilters()', () => {
            it('should return existing filters', () => {
                const filters = fromJS({tags: [1, 2]})
                state.stats = state.stats.set('filters', filters)
                expect(selectors.getFilters(state)).toEqual(filters)

                state.stats = state.stats.set('filters', null)
                expect(selectors.getFilters(state)).toEqual(null)
            })
        })

        describe('getViewfilters()', () => {
            it('should return no filter for the given view because there is no filter', () => {
                state.stats = state.stats.set('filters', null)
                expect(
                    selectors.DEPRECATED_makeStatsFiltersSelector(
                        'support-performance-overview'
                    )(state)
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
                state.stats = state.stats.set('filters', filters)
                expect(
                    selectors.DEPRECATED_makeStatsFiltersSelector(
                        'support-performance-overview'
                    )(state)
                ).toMatchSnapshot()
                expect(
                    selectors.DEPRECATED_makeStatsFiltersSelector(
                        'satisfaction'
                    )(state)
                ).toMatchSnapshot()
            })

            it('should remove integrations when they are not allowed in filters', () => {
                state.stats = state.stats.set(
                    'filters',
                    fromJS({
                        integrations: [1, 2],
                        period: {
                            start_datetime: '2019-03-09',
                            end_datetime: '2019-03-10',
                        },
                    })
                )
                state.integrations = state.stats.set(
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
                        state
                    )
                ).toMatchSnapshot()
            })

            it("should add an integration in the filters because it's a required field", () => {
                state.stats = state.stats.set(
                    'filters',
                    fromJS({
                        integrations: [],
                        period: {
                            start_datetime: '2019-03-09',
                            end_datetime: '2019-03-10',
                        },
                    })
                )
                state.integrations = state.stats.set(
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
                        state
                    )
                ).toMatchSnapshot()
            })

            it('should return a default period if missing from the filters', () => {
                state.stats = state.stats.set('filters', fromJS({}))
                expect(
                    selectors.DEPRECATED_makeStatsFiltersSelector(
                        'live-agents'
                    )(state)
                ).toMatchSnapshot()
            })
        })
    })
})
