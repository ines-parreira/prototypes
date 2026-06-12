import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockSearchTicketsHandler } from '@gorgias/helpdesk-mocks'

import { ticket } from 'fixtures/ticket'
import type { ApiListResponseCursorPagination } from 'models/api/types'
import {
    searchTickets,
    searchTicketsWithHighlights,
} from 'models/ticket/resources'
import type { Ticket } from 'models/ticket/types'
import { Cancel, CancelToken } from 'tests/axiosRuntime'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

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
        it('should resolve with the ticket list and meta on success', async () => {
            server.use(
                mockSearchTicketsHandler(async () =>
                    HttpResponse.json(defaultData as any),
                ).handler,
            )

            const res = await searchTickets({
                search: '',
            })

            expect(res.data).toEqual(defaultData)
        })

        it('should pass the search phrase and filters in the payload', async () => {
            const searchTicketsMock = mockSearchTicketsHandler()
            const waitForSearchTicketsRequest =
                searchTicketsMock.waitForRequest(server)
            server.use(searchTicketsMock.handler)
            const options = {
                search: 'foo',
                filters: 'bar',
            }

            await searchTickets(options)

            await waitForSearchTicketsRequest(async (request) => {
                expect(await request.json()).toEqual(options)
                expect(new URL(request.url).search).toBe('')
            })
        })

        it('should pass cursor and limit in the params', async () => {
            const searchTicketsMock = mockSearchTicketsHandler()
            const waitForSearchTicketsRequest =
                searchTicketsMock.waitForRequest(server)
            server.use(searchTicketsMock.handler)
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

            await waitForSearchTicketsRequest(async (request) => {
                const searchParams = new URL(request.url).searchParams

                expect(await request.json()).toEqual(options)
                expect(searchParams.get('cursor')).toBe(cursor)
                expect(searchParams.get('limit')).toBe(String(limit))
            })
        })

        it('should pass cancel token', async () => {
            const source = CancelToken.source()
            source.cancel()

            await expect(
                searchTickets({
                    search: '',
                    cancelToken: source.token,
                }),
            ).rejects.toBeInstanceOf(Cancel)
        })

        it('should add with_highlights prop', async () => {
            const searchTicketsMock = mockSearchTicketsHandler()
            const waitForSearchTicketsRequest =
                searchTicketsMock.waitForRequest(server)
            server.use(searchTicketsMock.handler)
            const options = {
                search: 'foo',
            }
            const params = {
                withHighlights: true,
            }

            await searchTickets({ ...options, ...params })

            await waitForSearchTicketsRequest(async (request) => {
                const searchParams = new URL(request.url).searchParams

                expect(await request.json()).toEqual({
                    ...options,
                    filters: '',
                })
                expect(searchParams.get('with_highlights')).toBe('true')
            })
        })

        it('should add track_total_hits prop', async () => {
            const searchTicketsMock = mockSearchTicketsHandler()
            const waitForSearchTicketsRequest =
                searchTicketsMock.waitForRequest(server)
            server.use(searchTicketsMock.handler)
            const options = {
                search: 'foo',
            }
            const params = {
                trackTotalHits: true,
            }

            await searchTickets({ ...options, ...params })

            await waitForSearchTicketsRequest(async (request) => {
                const searchParams = new URL(request.url).searchParams

                expect(await request.json()).toEqual({
                    ...options,
                    filters: '',
                })
                expect(searchParams.get('track_total_hits')).toBe('true')
            })
        })
    })

    describe('searchTicketsWithHighlights', () => {
        it('should call searchTickets withHighlights and merge Tickets with their highlights', async () => {
            const highlights = {}
            const searchTicketsMock = mockSearchTicketsHandler(async () =>
                HttpResponse.json({
                    ...defaultData,
                    data: [
                        {
                            entity: ticket,
                            highlights,
                        },
                    ],
                } as any),
            )
            const waitForSearchTicketsRequest =
                searchTicketsMock.waitForRequest(server)
            server.use(searchTicketsMock.handler)
            const options = { search: 'foo', filters: '' }

            const response = await searchTicketsWithHighlights(options)

            await waitForSearchTicketsRequest(async (request) => {
                const searchParams = new URL(request.url).searchParams

                expect(await request.json()).toEqual(options)
                expect(searchParams.get('with_highlights')).toBe('true')
            })

            expect(response.data.data).toEqual([
                {
                    ...ticket,
                    highlights,
                },
            ])
        })
    })
})
