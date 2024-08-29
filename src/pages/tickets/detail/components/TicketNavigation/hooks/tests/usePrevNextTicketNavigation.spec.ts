import {renderHook} from '@testing-library/react-hooks'
import useAppDispatch from 'hooks/useAppDispatch'

import {SegmentEvent} from 'common/segment'
import * as segmentTracker from 'common/segment'
import * as ticketActions from 'state/ticket/actions'
import usePrevNextTicketNavigation from '../usePrevNextTicketNavigation'

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = useAppDispatch as jest.Mock
const logEventMock = jest.spyOn(segmentTracker, 'logEvent')
const clearTicketMock = jest.spyOn(ticketActions, 'clearTicket')
const goToNextOrPrevTicketMock = jest.spyOn(
    ticketActions,
    '_goToNextOrPrevTicket'
)

describe('usePrevNextTicketNavigation', () => {
    const ticketNumber = '123'

    const prevDirection = 'prev'
    const nextDirection = 'next'

    let dispatch: jest.Mock

    beforeEach(() => {
        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
    })

    it('should test PREV navigation', async () => {
        const {result} = renderHook(() =>
            usePrevNextTicketNavigation(prevDirection, ticketNumber)
        )

        expect(result.current).toEqual(expect.any(Function))

        await result.current()

        expect(logEventMock).toHaveBeenCalledTimes(1)
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.TicketPreviousNavigation
        )
        expect(useAppDispatchMock).toHaveBeenCalledTimes(1)
        expect(clearTicketMock).toHaveBeenCalledTimes(1)
        expect(goToNextOrPrevTicketMock).toHaveBeenCalledTimes(1)
        expect(goToNextOrPrevTicketMock).toHaveBeenCalledWith(
            parseFloat(ticketNumber),
            prevDirection
        )
    })

    it('should test NEXT navigation', async () => {
        const {result} = renderHook(() =>
            usePrevNextTicketNavigation(nextDirection, ticketNumber)
        )

        expect(result.current).toEqual(expect.any(Function))

        await result.current()

        expect(logEventMock).toHaveBeenCalledTimes(1)
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.TicketNextNavigation
        )
        expect(useAppDispatchMock).toHaveBeenCalledTimes(1)
        expect(clearTicketMock).toHaveBeenCalledTimes(1)
        expect(goToNextOrPrevTicketMock).toHaveBeenCalledTimes(1)
        expect(goToNextOrPrevTicketMock).toHaveBeenCalledWith(
            parseFloat(ticketNumber),
            nextDirection
        )
    })
})
