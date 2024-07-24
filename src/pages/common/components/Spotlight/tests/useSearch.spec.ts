import {KeyboardEvent} from 'react'
import {act, renderHook} from '@testing-library/react-hooks'
import {ticket} from 'fixtures/ticket'
import {customer} from 'fixtures/customer'
import {searchCustomersWithHighlights} from 'models/customer/resources'
import {searchTicketsWithHighlights} from 'models/ticket/resources'
import {ViewType} from 'models/view/types'
import {useSearch} from 'pages/common/components/Spotlight/useSearch'
import {assumeMock} from 'utils/testing'

jest.mock('models/customer/resources')
const searchCustomersWithHighlightsMock = assumeMock(
    searchCustomersWithHighlights
)
jest.mock('models/ticket/resources')
const searchTicketsWithHighlightsMock = assumeMock(searchTicketsWithHighlights)
jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('hooks/useSearchRankScenario', () => ({
    ...jest.requireActual<Record<string, unknown>>(
        'hooks/useSearchRankScenario'
    ),
    useSearchRankScenario: jest.fn(),
    default: jest.fn().mockReturnValue({
        endScenario: jest.fn(),
        registerResultsRequest: jest.fn(),
        registerResultsResponse: jest.fn(),
    }),
}))

describe('useSearch', () => {
    const customerWithHighlightsResponse = {
        ...customer,
        highlights: {},
    }
    const ticketWithHighlightsResponse = {
        ...ticket,
        highlights: {},
    }

    it('should return fetched customers with highlights callback', async () => {
        searchCustomersWithHighlightsMock.mockResolvedValue({
            data: {
                data: [customerWithHighlightsResponse],
                meta: {next_cursor: '', prev_cursor: null},
                object: '',
                uri: '',
            },
        } as any)
        const {result} = renderHook(() => useSearch())
        await act(async () => {
            await result.current.fetchSearchItems('john', ViewType.CustomerList)
        })

        expect(result.current.customers).toEqual([
            {
                ...customerWithHighlightsResponse,
                highlights: customerWithHighlightsResponse.highlights,
            },
        ])
    })

    it('should return fetched tickets with highlights callback', async () => {
        searchTicketsWithHighlightsMock.mockResolvedValue({
            data: {
                data: [ticketWithHighlightsResponse],
                meta: {next_cursor: '', prev_cursor: null},
                object: '',
                uri: '',
            },
        } as any)
        const {result} = renderHook(() => useSearch())
        await act(async () => {
            await result.current.fetchSearchItems('john', ViewType.TicketList)
        })

        expect(result.current.tickets).toEqual([
            {
                ...ticketWithHighlightsResponse,
                highlights: ticketWithHighlightsResponse.highlights,
            },
        ])
    })

    it('should update state after fetching tickets with highlights in federated search', async () => {
        searchTicketsWithHighlightsMock.mockResolvedValue({
            data: {
                data: [ticketWithHighlightsResponse],
                meta: {next_cursor: '', prev_cursor: null},
                object: '',
                uri: '',
            },
        } as any)
        searchCustomersWithHighlightsMock.mockResolvedValue({
            data: {
                data: [customerWithHighlightsResponse],
                meta: {next_cursor: '', prev_cursor: null},
                object: '',
                uri: '',
            },
        } as any)

        const {result} = renderHook(() => useSearch())
        act(() => {
            result.current.handleSearchInput('some query')
        })
        await act(async () => {
            await result.current.searchCallback({} as KeyboardEvent, jest.fn())
        })

        expect(result.current.customers).toEqual([
            {
                ...customerWithHighlightsResponse,
                highlights: customerWithHighlightsResponse.highlights,
            },
        ])
        expect(result.current.tickets).toEqual([
            {
                ...ticketWithHighlightsResponse,
                highlights: ticketWithHighlightsResponse.highlights,
            },
        ])
    })
})
