import React, {ReactNode} from 'react'
import {fromJS, Map} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import _keyBy from 'lodash/keyBy'
import {renderHook} from 'react-hooks-testing-library'

import {TicketChannels} from 'business/ticket'
import {tags} from 'fixtures/tag'
import {RootState} from 'state/types'

import {formatDuration, useStatsViewFilters} from '../utils'

const mockStore = configureMockStore([thunk])

describe('stats components utils', () => {
    describe('useStatsViewFilters', () => {
        const defaultState = {
            entities: {
                tags: _keyBy(tags, 'id'),
            },
        } as RootState

        const DefaultStateWrapper = ({children}: {children?: ReactNode}) => (
            <Provider store={mockStore(defaultState)}>{children}</Provider>
        )

        it.each<[string, Map<any, any>]>([
            [
                'period',
                fromJS({
                    period: {
                        start_datetime: '2021-05-29T00:00:00+02:00',
                        end_datetime: '2021-06-04T23:59:59+04:00',
                    },
                }),
            ],
            ['single channel', fromJS({channels: [TicketChannels.EMAIL]})],
            [
                'multiple channels',
                fromJS({
                    channels: [TicketChannels.EMAIL, TicketChannels.CHAT],
                }),
            ],
            [
                'single integration',
                fromJS({
                    integrations: [1],
                }),
            ],
            [
                'multiple integrations',
                fromJS({
                    integrations: [1, 5],
                }),
            ],
            [
                'single agent',
                fromJS({
                    agents: [1],
                }),
            ],
            [
                'multiple agents',
                fromJS({
                    agents: [1, 2, 3],
                }),
            ],
            [
                'tags',
                fromJS({
                    tags: [tags[0].id],
                }),
            ],
        ])('should return view filters for %s', (testName, statsFilters) => {
            const {result} = renderHook(
                () => {
                    return useStatsViewFilters(
                        'ticket.created_datetime',
                        statsFilters
                    )
                },
                {
                    wrapper: DefaultStateWrapper,
                }
            )
            expect(result.current).toMatchSnapshot()
        })

        it("should not include tags that don't exist in the store", () => {
            const {result} = renderHook(
                () => {
                    return useStatsViewFilters(
                        'ticket.created_datetime',
                        fromJS({
                            tags: [999999],
                        })
                    )
                },
                {
                    wrapper: DefaultStateWrapper,
                }
            )
            expect(result.current).toEqual([])
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
