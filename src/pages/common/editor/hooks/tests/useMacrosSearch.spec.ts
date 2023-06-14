import {act, renderHook} from '@testing-library/react-hooks'
import _noop from 'lodash/noop'

import {ticket as defaultTicket} from 'fixtures/ticket'
import {fetchMacros} from 'models/macro/resources'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {flushPromises} from 'utils/testing'

import useMacrosSearch, {SEARCH_DEBOUNCE_DELAY} from '../useMacrosSearch'

jest.mock('models/macro/resources', () => ({
    fetchMacros: jest.fn(),
}))

jest.mock('store/middlewares/segmentTracker')

const fetchMacrosMock = fetchMacros as jest.Mock
const logEventMock = logEvent as jest.Mock

describe('useMacrosSearch', () => {
    const defaultOptions = {
        filters: {},
        query: '',
        ticket: defaultTicket,
    }

    beforeEach(() => {
        jest.resetAllMocks()
        logEventMock.mockImplementation(_noop)

        fetchMacrosMock.mockResolvedValue({
            data: {
                data: [{id: 1}, {id: 2}],
                meta: {next_cursor: 'beepboop'},
            },
        })
    })

    it('should return the default state', async () => {
        const {result} = renderHook(() => useMacrosSearch(defaultOptions))

        expect(result.current).toEqual({
            initialLoaded: false,
            loadMacros: expect.any(Function),
            macros: [],
            nextCursor: null,
        })

        await act(async () => {
            await flushPromises()
        })
    })

    it('should request macro data on mounting', async () => {
        fetchMacrosMock.mockResolvedValue({
            data: {
                data: [{id: 1}, {id: 2}],
                meta: {next_cursor: 'beepboop'},
            },
        })

        const {result} = renderHook(() => useMacrosSearch(defaultOptions))

        expect(fetchMacrosMock).toHaveBeenCalledWith(
            expect.objectContaining({
                messageId: 182,
                numberPredictions: 3,
                search: '',
                ticketId: 152,
            }),
            expect.objectContaining({cancelToken: expect.any(Object)})
        )

        await act(async () => {
            await flushPromises()
        })

        expect(result.current).toEqual({
            initialLoaded: true,
            loadMacros: expect.any(Function),
            macros: [{id: 1}, {id: 2}],
            nextCursor: 'beepboop',
        })
    })

    it('should log an event if a search is executed due to changing parameters', async () => {
        jest.useFakeTimers()

        fetchMacrosMock.mockResolvedValue({
            data: {
                data: [{id: 3}, {id: 4}],
                meta: {next_cursor: 'boopbeep'},
            },
        })

        const {rerender, result} = renderHook(
            (options) => useMacrosSearch(options),
            {initialProps: defaultOptions}
        )

        await act(async () => {
            rerender({...defaultOptions, query: 'beep'})
            await flushPromises()
            jest.advanceTimersByTime(SEARCH_DEBOUNCE_DELAY)
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.TicketMacrosSearch,
            {
                changed: ['search'],
                search: 'beep',
            }
        )

        await act(async () => {
            await flushPromises()
        })

        expect(result.current).toEqual({
            initialLoaded: true,
            loadMacros: expect.any(Function),
            macros: [{id: 3}, {id: 4}],
            nextCursor: 'boopbeep',
        })
        jest.useRealTimers()
    })

    it('should replace macros when calling loadMacros without an argument', async () => {
        fetchMacrosMock
            .mockResolvedValueOnce({
                data: {
                    data: [{id: 1}, {id: 2}],
                    meta: {next_cursor: 'beepboop'},
                },
            })
            .mockResolvedValueOnce({
                data: {
                    data: [{id: 3}, {id: 4}],
                    meta: {next_cursor: 'boopbeep'},
                },
            })

        const {result} = renderHook(() => useMacrosSearch(defaultOptions))

        await act(async () => {
            await flushPromises()
        })

        await act(async () => {
            await result.current.loadMacros()
            await flushPromises()
        })

        expect(result.current).toEqual({
            initialLoaded: true,
            loadMacros: expect.any(Function),
            macros: [{id: 3}, {id: 4}],
            nextCursor: 'boopbeep',
        })
    })

    it('should append more macros when calling loadMacros with true', async () => {
        fetchMacrosMock
            .mockResolvedValueOnce({
                data: {
                    data: [{id: 1}, {id: 2}],
                    meta: {next_cursor: 'beepboop'},
                },
            })
            .mockResolvedValueOnce({
                data: {
                    data: [{id: 3}, {id: 4}],
                    meta: {next_cursor: 'boopbeep'},
                },
            })

        const {result} = renderHook(() => useMacrosSearch(defaultOptions))

        await act(async () => {
            await flushPromises()
        })

        await act(async () => {
            await result.current.loadMacros(true)
            await flushPromises()
        })

        expect(result.current).toEqual({
            initialLoaded: true,
            loadMacros: expect.any(Function),
            macros: [{id: 1}, {id: 2}, {id: 3}, {id: 4}],
            nextCursor: 'boopbeep',
        })
    })
})
