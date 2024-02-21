import {act, renderHook} from '@testing-library/react-hooks'

import {CursorMeta} from 'models/api/types'

import {TicketPartial} from '../../types'
import TicketUpdatesManager from '../../TicketUpdatesManager'
import useTicketPartials from '../useTicketPartials'

jest.mock('../../TicketUpdatesManager', () => jest.fn())
const TicketUpdatesManagerMock = TicketUpdatesManager as jest.Mock

type Listener = (
    partials: TicketPartial[],
    cursor: CursorMeta['next_cursor']
) => void

describe('useTicketPartials', () => {
    let loadMore: jest.Mock
    let subscribe: jest.Mock
    let unsubscribe: jest.Mock

    beforeEach(() => {
        loadMore = jest.fn()
        unsubscribe = jest.fn()
        subscribe = jest.fn(() => unsubscribe)
        TicketUpdatesManagerMock.mockReturnValue({loadMore, subscribe})
    })

    it('should should subscribe to ticket updates on mount', () => {
        renderHook(() => useTicketPartials(123, 'created_datetime:asc'))
        expect(subscribe).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should unsubscribe from ticket updates on unmount', () => {
        const {unmount} = renderHook(() =>
            useTicketPartials(123, 'created_datetime:asc')
        )
        unmount()
        expect(unsubscribe).toHaveBeenCalledWith()
    })

    it('should not call loadMore on the client if no cursor is available', () => {
        const {result} = renderHook(() =>
            useTicketPartials(123, 'created_datetime:asc')
        )
        expect(result.current.loadMore).toEqual(expect.any(Function))

        result.current.loadMore()
        expect(loadMore).not.toHaveBeenCalled()
    })

    it('should call loadMore on the client if a cursor is available', () => {
        const {result} = renderHook(() =>
            useTicketPartials(123, 'created_datetime:asc')
        )

        const [[listener]] = subscribe.mock.calls as [[Listener]]

        act(() => {
            listener([], 'random-cursor')
        })

        result.current.loadMore()
        expect(loadMore).toHaveBeenCalledWith()
    })

    it('should update initialLoaded state when partials are received', () => {
        const {result} = renderHook(() =>
            useTicketPartials(123, 'created_datetime:asc')
        )
        const [[listener]] = subscribe.mock.calls as [[Listener]]

        act(() => {
            listener([], 'random-cursor')
        })

        expect(result.current.initialLoaded).toEqual(true)
    })

    it('should reset initialLoaded state when viewId changes', () => {
        const {result, rerender} = renderHook(
            ({viewId}) => useTicketPartials(viewId, 'created_datetime:asc'),
            {initialProps: {viewId: 123}}
        )
        const [[listener]] = subscribe.mock.calls as [[Listener]]

        act(() => {
            listener([], 'random-cursor')
        })

        rerender({viewId: 456})

        expect(result.current.initialLoaded).toEqual(false)
    })
})
