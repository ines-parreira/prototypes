import { assumeMock } from '@repo/testing'

import { searchTickets as apiSearchTickets } from '@gorgias/helpdesk-client'

import { ticket } from 'fixtures/ticket'
import type { ApiListResponseCursorPagination } from 'models/api/types'
import {
    searchTickets,
    searchTicketsWithHighlights,
} from 'models/ticket/resources'
import type { Ticket } from 'models/ticket/types'
import { CancelToken } from 'tests/axiosRuntime'

jest.mock('@gorgias/helpdesk-client')
const searchTicketsMock = assumeMock(apiSearchTickets)

describe('ticket resources', () => {
    const defaultData: ApiListResponseCursorPagination<Ticket[]> = {
        data: [ticket],
        meta: {
            next_cursor: null,
            prev_cursor: null,
            total_resources: null,
        },
        object: 'list',
        uri: '/api/tickets/search',
    }

    describe('searchTickets', () => {
        beforeEach(() => {
            searchTicketsMock.mockResolvedValue({ data: defaultData } as any)
        })

        it('should resolve with the ticket list and meta on success', async () => {
            const res = await searchTickets({
                search: '',
            })

            expect(res.data).toEqual(defaultData)
        })

        it('should pass the search phrase and filters in the payload', async () => {
            const options = {
                search: 'foo',
                filters: 'bar',
            }

            await searchTickets(options)

            expect(searchTicketsMock).toHaveBeenCalledWith(options, {}, {})
        })

        it('should pass cursor and limit in the params', async () => {
            const options = {
                search: 'foo',
                filters: '',
            }
            const cursor = 'some_cursor'
            const limit = 10

            await searchTickets({
                ...options,
                cursor,
                limit,
            })

            expect(searchTicketsMock).toHaveBeenCalledWith(
                options,
                { cursor, limit },
                {},
            )
        })

        it('should pass cancel token', async () => {
            const source = CancelToken.source()
            source.cancel()

            await searchTickets({
                search: '',
                cancelToken: source.token,
            })

            expect(searchTicketsMock).toHaveBeenCalledWith(
                {
                    search: '',
                    filters: '',
                },
                {},
                { cancelToken: source.token },
            )
        })

        it('should add with_highlights prop', async () => {
            const options = {
                search: 'foo',
            }
            const params = {
                withHighlights: true,
            }

            await searchTickets({ ...options, ...params })

            expect(searchTicketsMock).toHaveBeenCalledWith(
                { ...options, filters: '' },
                { with_highlights: params.withHighlights },
                {},
            )
        })

        it('should add track_total_hits prop', async () => {
            const options = {
                search: 'foo',
            }
            const params = {
                trackTotalHits: true,
            }

            await searchTickets({ ...options, ...params })

            expect(searchTicketsMock).toHaveBeenCalledWith(
                { ...options, filters: '' },
                { track_total_hits: params.trackTotalHits },
                {},
            )
        })
    })

    describe('searchTicketsWithHighlights', () => {
        it('should call searchTickets withHighlights and merge Tickets with their highlights', async () => {
            const highlights = {}
            searchTicketsMock.mockResolvedValue({
                data: {
                    ...defaultData,
                    data: [
                        {
                            entity: ticket,
                            highlights,
                        },
                    ],
                },
            } as any)
            const options = { search: 'foo', filters: '' }

            const response = await searchTicketsWithHighlights(options)

            expect(searchTicketsMock).toHaveBeenCalledWith(
                {
                    ...options,
                },
                { with_highlights: true },
                {},
            )

            expect(response.data.data).toEqual([
                {
                    ...ticket,
                    highlights,
                },
            ])
        })
    })
})
