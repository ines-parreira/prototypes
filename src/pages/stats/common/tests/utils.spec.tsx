import React, {ComponentType} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import _keyBy from 'lodash/keyBy'
import {renderHook} from '@testing-library/react-hooks'

import {tags} from 'fixtures/tag'
import {RootState} from 'state/types'
import {TicketChannel} from 'business/types/ticket'
import StatsFiltersContext from 'pages/stats/StatsFiltersContext'
import {StatsFilters} from 'models/stat/types'

import {
    formatNumber,
    formatDuration,
    useStatsViewFilters,
    findChannelNameKey,
    formatMetricValue,
    formatMetricTrend,
} from '../utils'

const mockStore = configureMockStore([thunk])

describe('stats components utils', () => {
    describe('formatNumber', () => {
        it.each([
            [123, '123'],
            [123456, '123,456'],
            [123456789, '123,456,789'],
            [4.56, '4.56'],
        ])('should format the number properly', (value, result) => {
            expect(formatNumber(value)).toBe(result)
        })
    })

    describe('useStatsViewFilters', () => {
        const defaultState = {
            entities: {
                tags: _keyBy(tags, 'id'),
            },
        } as RootState
        const defaultStatsFilters: StatsFilters = {
            period: {
                start_datetime: '2021-05-29T00:00:00+02:00',
                end_datetime: '2021-06-04T23:59:59+04:00',
            },
        }

        it.each<[string, StatsFilters]>([
            ['period', defaultStatsFilters],
            [
                'single channel',
                {
                    ...defaultStatsFilters,
                    channels: [TicketChannel.Email],
                },
            ],
            [
                'multiple channels',
                {
                    ...defaultStatsFilters,
                    channels: [TicketChannel.Email, TicketChannel.Chat],
                },
            ],
            [
                'single integration',
                {
                    ...defaultStatsFilters,
                    integrations: [1],
                },
            ],
            [
                'multiple integrations',
                {
                    ...defaultStatsFilters,
                    integrations: [1, 5],
                },
            ],
            [
                'single agent',
                {
                    ...defaultStatsFilters,
                    agents: [1],
                },
            ],
            [
                'multiple agents',
                {
                    ...defaultStatsFilters,
                    agents: [1, 2, 3],
                },
            ],
            [
                'tags',
                {
                    ...defaultStatsFilters,
                    tags: [tags[0].id],
                },
            ],
        ])('should return view filters for %s', (testName, statsFilters) => {
            const wrapper: ComponentType = ({children}) => (
                <Provider store={mockStore(defaultState)}>
                    <StatsFiltersContext.Provider value={statsFilters}>
                        {children}
                    </StatsFiltersContext.Provider>
                </Provider>
            )

            const {result} = renderHook(
                () => {
                    return useStatsViewFilters('ticket.created_datetime')
                },
                {wrapper}
            )

            expect(result.current).toMatchSnapshot()
        })

        it('should not include a view filter if the corresponding stat filter is an empty array', () => {
            const wrapper: ComponentType = ({children}) => (
                <Provider store={mockStore(defaultState)}>
                    <StatsFiltersContext.Provider
                        value={{
                            ...defaultStatsFilters,
                            integrations: [],
                            agents: [],
                            channels: [],
                            tags: [],
                            score: [],
                        }}
                    >
                        {children}
                    </StatsFiltersContext.Provider>
                </Provider>
            )

            const {result} = renderHook(
                () => {
                    return useStatsViewFilters('ticket.created_datetime')
                },
                {wrapper}
            )

            expect(result.current).toMatchSnapshot()
        })

        it("should not include tags that don't exist in the store", () => {
            const wrapper: ComponentType = ({children}) => (
                <Provider store={mockStore(defaultState)}>
                    <StatsFiltersContext.Provider
                        value={{
                            ...defaultStatsFilters,
                            tags: [99999],
                        }}
                    >
                        {children}
                    </StatsFiltersContext.Provider>
                </Provider>
            )

            const {result} = renderHook(
                () => {
                    return useStatsViewFilters('ticket.created_datetime')
                },
                {wrapper}
            )

            expect(result.current).toMatchSnapshot()
        })
    })

    describe('formatDuration', () => {
        it.each<[string, number, string]>([
            ['empty value', 0, '0s'],
            ['second', 1, '1s'],
            ['minute', 60, '1m'],
            ['hour', 3600, '1h'],
            ['day', 24 * 3600, '1d'],
            ['month', 24 * 3600 * 31, '1mo'],
        ])('should match template for %s', (testName, duration, expected) => {
            expect(formatDuration(duration)).toBe(expected)
        })
        it.each<[number, string]>([
            [1, '1mo'],
            [2, '1mo 1d'],
            [3, '1mo 1d 1h'],
            [4, '1mo 1d 1h 1m'],
            [5, '1mo 1d 1h 1m 1s'],
        ])('should match template for precision %i', (precision, expected) => {
            const duration = 24 * 3600 * 31 + 24 * 3600 + 3600 + 60 + 1
            expect(formatDuration(duration, precision)).toBe(expected)
        })
    })

    describe('findChannelNameKey', () => {
        it('should return the correct channel name key', () => {
            const key = findChannelNameKey('Facebook Mention')
            expect(key).toBe(TicketChannel.FacebookMention)
        })

        it('should return undefined when key is unknown', () => {
            const key = findChannelNameKey('Something else')
            expect(key).toBeUndefined()
        })
    })

    describe('formatMetricValue', () => {
        it('should format value up to two decimal places when format is "decimal"', () => {
            expect(formatMetricValue(123456.789, 'decimal')).toBe('123,456.79')
        })

        it('should format value as duration with precision two when format is "duration"', () => {
            const minuteInSeconds = 60
            const hourInSeconds = 60 * minuteInSeconds
            const dayInSeconds = 24 * hourInSeconds

            expect(
                formatMetricValue(
                    5 * dayInSeconds +
                        17 * hourInSeconds +
                        42 * minuteInSeconds +
                        33,
                    'duration'
                )
            ).toBe('5d 17h')
        })
    })

    describe('formatMetricTrend', () => {
        it('should format trend up to one decimal when format is "decimal"', () => {
            expect(formatMetricTrend(13.14, 10, 'decimal')).toBe('+3.1')
        })

        it('should format trend as duration with precision one when format is "duration"', () => {
            const minuteInSeconds = 60

            expect(
                formatMetricTrend(
                    38 * minuteInSeconds + 15,
                    21 * minuteInSeconds + 6,
                    'duration'
                )
            ).toBe('+17m')
        })

        it('should format trend as percent with no decimal places when format is "percent"', () => {
            expect(formatMetricTrend(2.3, 1.2, 'percent')).toBe('+92%')
        })
    })
})
