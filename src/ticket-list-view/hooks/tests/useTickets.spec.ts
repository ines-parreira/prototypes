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
    })

    it('should return tickets', () => {
        useTicketPartialsMock.mockReturnValue({partials})
        const {result} = renderHook(() => useTickets(123))
        expect(result.current).toBe(partials)
    })
})
