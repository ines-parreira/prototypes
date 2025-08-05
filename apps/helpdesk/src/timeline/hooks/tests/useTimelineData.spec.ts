import { assumeMock, renderHook } from '@repo/testing'

import { useListTickets } from '@gorgias/helpdesk-queries'

import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import * as timelineItem from 'timeline/helpers/timelineItem'
import { useTimelineData } from 'timeline/hooks/useTimelineData'

import { TICKET_FETCH_STALE_TIME, TICKET_FETCHED_LIMIT } from '../../constants'

jest.mock('@gorgias/helpdesk-queries', () => ({
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useListTickets: jest.fn(),
}))

jest.mock('hooks/useAppSelector')
jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

const useListTicketsMock = assumeMock(useListTickets)
const useAppSelectorMock = assumeMock(useAppSelector)
const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

describe('useTimelineData', () => {
    const ticketList = [
        {
            id: 1,
        },
        {
            id: 2,
        },
    ]

    beforeEach(() => {
        useListTicketsMock.mockReturnValue({
            data: {
                data: { data: ticketList },
            },
            isLoading: true as boolean,
            isError: false,
        } as ReturnType<typeof useListTickets>)

        // Mock useAppSelector to return a customer object with toJS method
        useAppSelectorMock.mockReturnValue({
            toJS: () => ({ integrations: {} }),
        })
    })

    it('should call useListTicket with correct params', () => {
        const { rerender } = renderHook((id?: number) => useTimelineData(id))

        expect(useListTicketsMock).toHaveBeenCalledWith(
            {
                trashed: false,
                limit: TICKET_FETCHED_LIMIT,
                customer_id: undefined,
            },
            {
                query: {
                    enabled: false,
                    staleTime: TICKET_FETCH_STALE_TIME,
                },
            },
        )

        rerender(123)

        expect(useListTicketsMock).toHaveBeenLastCalledWith(
            {
                trashed: false,
                limit: TICKET_FETCHED_LIMIT,
                customer_id: 123,
            },
            {
                query: {
                    enabled: true,
                    staleTime: TICKET_FETCH_STALE_TIME,
                },
            },
        )
    })

    it('should return mixed ticket and order list', () => {
        mockUseFlag.mockReturnValue(true)
        useAppSelectorMock.mockReturnValue({
            toJS: () => ({
                integrations: {
                    shopify: {
                        orders: [{ id: 1 }, { id: 2 }],
                        __integration_type__: 'shopify',
                    },
                },
            }),
        })

        const { result } = renderHook(() => useTimelineData(123))
        const items = result.current.items
        expect(
            items.filter(timelineItem.isTicket).map(timelineItem.toTicket),
        ).toEqual(ticketList)
        expect(
            items.filter(timelineItem.isOrder).map(timelineItem.toOrder),
        ).toEqual([{ id: 1 }, { id: 2 }])
    })

    it('should return customer ticket list', () => {
        const { result } = renderHook(() => useTimelineData(123))

        expect(result.current.items.map(timelineItem.toTicket)).toEqual(
            ticketList,
        )
    })

    it('should return empty array if customer id is not provided', () => {
        const { result } = renderHook(() => useTimelineData())

        expect(result.current.items.map(timelineItem.toTicket)).toEqual([])
    })

    it('should return loading state', () => {
        const { result } = renderHook(() => useTimelineData())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return error state', () => {
        const { result } = renderHook(() => useTimelineData())
        expect(result.current.isError).toBe(false)
    })
})
