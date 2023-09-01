import {waitFor} from '@testing-library/react'
import {renderHook} from '@testing-library/react-hooks'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import React from 'react'
import {statFiltersCleanWithPayload} from 'state/ui/stats/actions'
import {getCleanStatsFilters, isCleanStatsDirty} from 'state/ui/stats/selectors'
import {assumeMock} from 'utils/testing'

import {StatsFilters} from 'models/stat/types'
import {TicketChannel} from 'business/types/ticket'

import {RootState, StoreDispatch} from 'state/types'
import {useCleanStatsFilters} from '../useCleanStatsFilters'
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('state/ui/stats/selectors')
const isCleanStatsDirtyMock = assumeMock(isCleanStatsDirty)
const getCleanStatsFiltersMock = assumeMock(getCleanStatsFilters)

describe('useCleanStatsFilters', () => {
    const defaultStatsFilters: StatsFilters = {
        period: {
            start_datetime: '2021-05-29T00:00:00+02:00',
            end_datetime: '2021-06-04T23:59:59+02:00',
        },
        channels: [TicketChannel.Email],
        integrations: [1],
        agents: [2],
        tags: [1, 2],
    }

    beforeEach(() => {
        isCleanStatsDirtyMock.mockReturnValue(false)
        getCleanStatsFiltersMock.mockReturnValue(null)
    })

    it('should return the stats filters if they are clean', () => {
        const {result} = renderHook(
            () => useCleanStatsFilters(defaultStatsFilters),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore({})}>{children}</Provider>
                ),
            }
        )

        expect(result.current).toBe(defaultStatsFilters)
    })

    it('should return the initial stats filters even if they are dirty', () => {
        isCleanStatsDirtyMock.mockReturnValue(true)

        const {result} = renderHook(
            () => useCleanStatsFilters(defaultStatsFilters),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore({})}>{children}</Provider>
                ),
            }
        )

        expect(result.current).toBe(defaultStatsFilters)
    })

    it('should return the last clean stats filters when they are dirty', () => {
        getCleanStatsFiltersMock.mockReturnValue(defaultStatsFilters)
        const {result, rerender} = renderHook<
            {
                statsFilters: StatsFilters
            },
            StatsFilters
        >(({statsFilters}) => useCleanStatsFilters(statsFilters), {
            initialProps: {statsFilters: defaultStatsFilters},
            wrapper: ({children}) => (
                <Provider store={mockStore({})}>{children}</Provider>
            ),
        })

        isCleanStatsDirtyMock.mockReturnValue(true)
        rerender({
            statsFilters: {
                ...defaultStatsFilters,
                channels: [TicketChannel.Api],
            },
        })

        expect(result.current).toBe(defaultStatsFilters)
    })

    it('should return the passed stats filters after they are clean again', () => {
        getCleanStatsFiltersMock.mockReturnValue(defaultStatsFilters)
        const {result, rerender} = renderHook<
            {
                statsFilters: StatsFilters
            },
            StatsFilters
        >(({statsFilters}) => useCleanStatsFilters(statsFilters), {
            initialProps: {statsFilters: defaultStatsFilters},
            wrapper: ({children}) => (
                <Provider store={mockStore({})}>{children}</Provider>
            ),
        })

        isCleanStatsDirtyMock.mockReturnValue(true)
        rerender({
            statsFilters: {
                ...defaultStatsFilters,
                channels: [TicketChannel.Api],
            },
        })
        isCleanStatsDirtyMock.mockReturnValue(false)
        getCleanStatsFiltersMock.mockReturnValue({
            ...defaultStatsFilters,
            channels: [TicketChannel.Facebook],
        })
        rerender({
            statsFilters: {
                ...defaultStatsFilters,
                channels: [TicketChannel.Facebook],
            },
        })

        expect(result.current.channels).toEqual([TicketChannel.Facebook])
    })

    it('should return passed statsFilters if the clean filters update is triggered', async () => {
        const store = mockStore({})
        const updatingFilters = {
            period: {
                ...defaultStatsFilters.period,
                end_datetime: '2021-07-04T23:59:59+02:00',
            },
        }
        isCleanStatsDirtyMock.mockReturnValue(false)
        getCleanStatsFiltersMock.mockReturnValue(defaultStatsFilters)
        const {result} = renderHook<
            {
                statsFilters: StatsFilters
            },
            StatsFilters
        >(({statsFilters}) => useCleanStatsFilters(statsFilters), {
            initialProps: {statsFilters: updatingFilters},
            wrapper: ({children}) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(
                statFiltersCleanWithPayload(updatingFilters)
            )
            expect(result.current).toEqual(updatingFilters)
        })
    })
})
