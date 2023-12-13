import {act, renderHook} from '@testing-library/react-hooks'

import {CursorMeta} from 'models/api/types'

import {TicketPartial} from '../../types'
import TicketUpdatesManager from '../../TicketUpdatesManager'
import useTicketPartials from '../useTicketPartials'

jest.mock('../../TicketUpdatesManager', () => jest.fn())
const TicketUpdatesManagerMock = TicketUpdatesManager as jest.Mock

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
        renderHook(() => useTicketPartials(123))
        expect(subscribe).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should unsubscribe from ticket updates on unmount', () => {
        const {unmount} = renderHook(() => useTicketPartials(123))
        unmount()
        expect(unsubscribe).toHaveBeenCalledWith()
    })

    it('should not call loadMore on the client if no cursor is available', () => {
        const {result} = renderHook(() => useTicketPartials(123))
        expect(result.current.loadMore).toEqual(expect.any(Function))

        result.current.loadMore()
        expect(loadMore).not.toHaveBeenCalled()
    })

    it('should call loadMore on the client if a cursor is available', () => {
        const {result} = renderHook(() => useTicketPartials(123))

        const [[listener]] = subscribe.mock.calls as [
            [
                (
                    partials: TicketPartial[],
                    cursor: CursorMeta['next_cursor']
                ) => void
            ]
        ]

        act(() => {
            listener([], 'random-cursor')
        })

        result.current.loadMore()
        expect(loadMore).toHaveBeenCalledWith()
    })
})
