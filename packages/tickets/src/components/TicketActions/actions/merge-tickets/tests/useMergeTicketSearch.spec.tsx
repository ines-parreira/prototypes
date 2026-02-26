import { act } from '@testing-library/react'

import { mockTicket } from '@gorgias/helpdesk-mocks'
import { useSearchTickets } from '@gorgias/helpdesk-queries'
import type * as helpdeskQueriesModule from '@gorgias/helpdesk-queries'

import { renderHook } from '../../../../../tests/render.utils'
import { useMergeTicketSearch } from '../useMergeTicketSearch'

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual<typeof helpdeskQueriesModule>(
        '@gorgias/helpdesk-queries',
    )

    return {
        ...actual,
        useSearchTickets: vi.fn(),
    }
})

const mockedUseSearchTickets = vi.mocked(useSearchTickets)

describe('useMergeTicketSearch', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockedUseSearchTickets.mockReturnValue({
            data: undefined,
            isFetching: false,
        } as any)
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should debounce search before querying tickets', () => {
        vi.useFakeTimers()

        const ticket = mockTicket({
            id: 123,
        })

        const { result } = renderHook(() => useMergeTicketSearch(ticket))

        expect(mockedUseSearchTickets).toHaveBeenLastCalledWith(
            expect.objectContaining({
                search: '',
            }),
            expect.any(Object),
            expect.any(Object),
        )

        act(() => {
            result.current.setSearchQuery('target')
        })

        expect(mockedUseSearchTickets).toHaveBeenLastCalledWith(
            expect.objectContaining({
                search: '',
            }),
            expect.any(Object),
            expect.any(Object),
        )

        act(() => {
            vi.advanceTimersByTime(299)
        })

        expect(mockedUseSearchTickets).toHaveBeenLastCalledWith(
            expect.objectContaining({
                search: '',
            }),
            expect.any(Object),
            expect.any(Object),
        )

        act(() => {
            vi.advanceTimersByTime(1)
        })

        expect(mockedUseSearchTickets).toHaveBeenLastCalledWith(
            expect.objectContaining({
                search: 'target',
            }),
            expect.any(Object),
            expect.any(Object),
        )
    })

    it('should call search query with expected options', () => {
        const ticket = mockTicket({
            id: 123,
        })

        renderHook(() => useMergeTicketSearch(ticket))

        expect(mockedUseSearchTickets).toHaveBeenLastCalledWith(
            expect.objectContaining({
                filters: expect.any(String),
                search: '',
            }),
            expect.objectContaining({
                limit: 8,
                order_by: expect.stringContaining(':'),
            }),
            {
                query: {
                    refetchOnWindowFocus: false,
                },
            },
        )
    })
})
