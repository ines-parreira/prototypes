import React, {ComponentType} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import _keyBy from 'lodash/keyBy'
import {renderHook} from 'react-hooks-testing-library'

import {tags} from 'fixtures/tag'
import {RootState} from 'state/types'
import {TicketChannel} from 'business/types/ticket'
import StatsFiltersContext from 'pages/stats/StatsFiltersContext'
import {StatsFilters} from 'models/stat/types'

import {formatDuration, useStatsViewFilters} from '../utils'

const mockStore = configureMockStore([thunk])

describe('stats components utils', () => {
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
            ['second', 1, '1s'],
            ['minute', 60, '1m '],
            ['hour', 3600, '1h '],
            ['day', 24 * 3600, '1d '],
            ['month', 24 * 3600 * 31, '1mo '],
        ])('should match template for %s', (testName, duration, expected) => {
            expect(formatDuration(duration)).toBe(expected)
        })
        it.each<[number, string]>([
            [1, '1mo '],
            [2, '1mo 1d '],
            [3, '1mo 1d 1h '],
            [4, '1mo 1d 1h 1m '],
            [5, '1mo 1d 1h 1m 1s'],
        ])('should match template for precision %i', (precision, expected) => {
            const duration = 24 * 3600 * 31 + 24 * 3600 + 3600 + 60 + 1
            expect(formatDuration(duration, precision)).toBe(expected)
        })
    })
})
