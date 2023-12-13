import {renderHook} from '@testing-library/react-hooks'

import type {TicketPartial} from '../../types'
import useTickets from '../useTickets'
import useTicketPartials from '../useTicketPartials'

jest.mock('../useTicketPartials', () => jest.fn())
const useTicketPartialsMock = useTicketPartials as jest.Mock

describe('useTickets', () => {
    let partials: TicketPartial[] = []

    beforeEach(() => {
        partials = [{id: 123, updated_datetime: '28-11-2023T13:36:57'}]
        useTicketPartialsMock.mockReturnValue({
            hasMore: false,
            loading: false,
            loadMore: jest.fn(),
            partials,
        })
    })

    it('should return tickets', () => {
        const {result} = renderHook(() => useTickets(123))
        expect(result.current).toEqual({
            hasMore: false,
            loading: false,
            loadMore: expect.any(Function),
            tickets: partials,
        })
    })
})
