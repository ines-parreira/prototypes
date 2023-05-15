import {renderHook} from '@testing-library/react-hooks'
import useAppSelector from 'hooks/useAppSelector'
import {assumeMock} from 'utils/testing'

import {StatsFilters} from 'models/stat/types'
import {TicketChannel} from 'business/types/ticket'

import {useCleanStatsFilters} from '../useCleanStatsFilters'

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)

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
        useAppSelectorMock.mockReturnValue(false)
    })

    it('should return the stats filters if they are clean', () => {
        const {result} = renderHook(() =>
            useCleanStatsFilters(defaultStatsFilters)
        )

        expect(result.current).toBe(defaultStatsFilters)
    })

    it('should return the initial stats filters even if they are dirty', () => {
        useAppSelectorMock.mockReturnValue(true)

        const {result} = renderHook(() =>
            useCleanStatsFilters(defaultStatsFilters)
        )

        expect(result.current).toBe(defaultStatsFilters)
    })

    it('should return the last clean stats filters when they are dirty', () => {
        const {result, rerender} = renderHook<
            {
                statsFilters: StatsFilters
            },
            StatsFilters
        >(({statsFilters}) => useCleanStatsFilters(statsFilters), {
            initialProps: {statsFilters: defaultStatsFilters},
        })

        useAppSelectorMock.mockReturnValue(true)
        rerender({
            statsFilters: {
                ...defaultStatsFilters,
                channels: [TicketChannel.Api],
            },
        })

        expect(result.current).toBe(defaultStatsFilters)
    })

    it('should return the passed stats filters when the after they are clean again', () => {
        const {result, rerender} = renderHook<
            {
                statsFilters: StatsFilters
            },
            StatsFilters
        >(({statsFilters}) => useCleanStatsFilters(statsFilters), {
            initialProps: {statsFilters: defaultStatsFilters},
        })

        useAppSelectorMock.mockReturnValue(true)
        rerender({
            statsFilters: {
                ...defaultStatsFilters,
                channels: [TicketChannel.Api],
            },
        })
        useAppSelectorMock.mockReturnValue(false)
        rerender({
            statsFilters: {
                ...defaultStatsFilters,
                channels: [TicketChannel.Facebook],
            },
        })

        expect(result.current.channels).toEqual([TicketChannel.Facebook])
    })
})
