import {renderHook} from '@testing-library/react-hooks'

import {useFlag} from 'common/flags'
import useElementSize from 'hooks/useElementSize'
import useSplitTicketView from 'split-ticket-view-toggle/hooks/useSplitTicketView'

import type {TicketPartial} from '../../types'
import useTickets from '../useTickets'
import useTicketData from '../useTicketData'
import useTicketPartials from '../useTicketPartials'
import useScrollOffset from '../useScrollOffset'

jest.mock('common/flags', () => ({useFlag: jest.fn()}))
const useFlagMock = useFlag as jest.Mock

jest.mock('../useTicketData', () => jest.fn())
const useTicketDataMock = useTicketData as jest.Mock

jest.mock('../useTicketPartials', () => jest.fn())
const useTicketPartialsMock = useTicketPartials as jest.Mock

jest.mock('hooks/useElementSize', () => jest.fn())
const useElementSizeMock = useElementSize as jest.Mock

jest.mock('../useScrollOffset', () => jest.fn())
const useScrollOffsetMock = useScrollOffset as jest.Mock

jest.mock('split-ticket-view-toggle/hooks/useSplitTicketView')
const mockUseSplitTicketView = useSplitTicketView as jest.Mock

const mockSetPrevNextTicketIds = jest.fn()

describe('useTickets', () => {
    let partials: TicketPartial[] = []

    beforeEach(() => {
        partials = [
            {
                id: 123,
                updated_datetime: new Date('28-11-2023T13:36:57').getTime(),
            },
        ]
        useFlagMock.mockReturnValue(false)
        useTicketDataMock.mockReturnValue({data: {}})
        useTicketPartialsMock.mockReturnValue({
            hasMore: false,
            initialLoaded: false,
            loadMore: jest.fn(),
            setLatest: jest.fn(),
            partials,
        })
        useElementSizeMock.mockReturnValue([0, 160])
        useScrollOffsetMock.mockReturnValue([0])
        mockUseSplitTicketView.mockReturnValue({
            setPrevNextTicketIds: mockSetPrevNextTicketIds,
        })
    })

    it('should return tickets', () => {
        const {result} = renderHook(() =>
            useTickets(123, 'created_datetime:asc')
        )
        expect(result.current).toEqual({
            hasMore: false,
            initialLoaded: false,
            loadMore: expect.any(Function),
            setElement: expect.any(Function),
            staleTickets: {123: true},
            tickets: partials,
            newTickets: {},
            ticketIds: {current: [123]},
        })
    })

    it('should return new tickets', async () => {
        const {result, waitFor} = renderHook(() =>
            useTickets(123, 'created_datetime:asc')
        )

        const newTicket = {id: 456, updated_datetime: Date.now()}
        const newPartials = [...partials, newTicket]

        useTicketPartialsMock.mockReturnValue({
            hasMore: false,
            initialLoaded: true,
            loadMore: jest.fn(),
            setLatest: jest.fn(),
            partials: newPartials,
        })

        await waitFor(() => {
            expect(result.current).toEqual({
                hasMore: false,
                initialLoaded: true,
                loadMore: expect.any(Function),
                setElement: expect.any(Function),
                staleTickets: {123: true},
                tickets: newPartials,
                newTickets: {456: newTicket},
                ticketIds: {current: [123]},
            })
        })
    })

    it('should set prev and next ticket IDs', () => {
        const mockPartials = [
            ...partials,
            {id: 456, updated_datetime: Date.now()},
            {id: 789, updated_datetime: Date.now()},
        ]
        useTicketPartialsMock.mockReturnValue({
            hasMore: false,
            isLoaded: true,
            loadMore: jest.fn(),
            setLatest: jest.fn(),
            partials: mockPartials,
        })

        renderHook(() => useTickets(1, 'created_datetime:asc', 456))
        expect(mockSetPrevNextTicketIds).toHaveBeenCalledWith({
            next: 789,
            prev: 123,
        })
    })

    it('should register toggleUnread', () => {
        const mockRegisterToggleUnread = jest.fn()
        const mockToggleUnread = jest.fn()
        useTicketDataMock.mockReturnValue({
            data: {},
            toggleUnread: mockToggleUnread,
        })
        renderHook(() =>
            useTickets(1, 'created_datetime:asc', 456, mockRegisterToggleUnread)
        )
        expect(mockRegisterToggleUnread).toHaveBeenCalledWith(mockToggleUnread)
    })
})
