import {renderHook} from '@testing-library/react-hooks'

import TicketUpdatesManager from '../../TicketUpdatesManager'
import useTicketPartials from '../useTicketPartials'

jest.mock('../../TicketUpdatesManager', () => jest.fn())
const TicketUpdatesManagerMock = TicketUpdatesManager as jest.Mock

describe('useTicketPartials', () => {
    let subscribe: jest.Mock
    let unsubscribe: jest.Mock
    beforeEach(() => {
        unsubscribe = jest.fn()
        subscribe = jest.fn(() => unsubscribe)
        TicketUpdatesManagerMock.mockReturnValue({subscribe})
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
})
