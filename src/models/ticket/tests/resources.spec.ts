import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'

import client from 'models/api/resources'
import {ticket} from 'fixtures/ticket'
import {ApiListResponseCursorPagination, OrderDirection} from 'models/api/types'
import {
    Ticket,
    TicketSearchOptions,
    TicketSearchSortableProperties,
} from 'models/ticket/types'

import {searchTickets} from '../resources'

const mockedServer = new MockAdapter(client)

describe('ticket resources', () => {
    describe('searchTickets', () => {
        const defaultData: ApiListResponseCursorPagination<Ticket[]> = {
            data: [ticket],
            meta: {
                next_cursor: null,
                prev_cursor: null,
            },
            object: 'list',
            uri: '/api/tickets/search',
        }

        beforeEach(() => {
            mockedServer.reset()
            mockedServer.onPost('/api/tickets/search').reply(201, defaultData)
        })

        it('should resolve with the ticket list and meta on success', async () => {
            const res = await searchTickets({
                search: '',
            })

            expect(res.data).toEqual(defaultData)
        })

        it('should pass the search phrase and filters in the payload', async () => {
            const options: TicketSearchOptions = {
                search: 'foo',
                filters: 'bar',
            }

            await searchTickets(options)

            expect(JSON.parse(mockedServer.history.post[0].data)).toEqual(
                options
            )
        })

        it('should pass cursor and limit in the params', async () => {
            const cursor = 'some_cursor'
            const limit = 10

            await searchTickets({
                search: 'foo',
                cursor,
                limit,
            })

            expect(mockedServer.history.post[0].params).toEqual({cursor, limit})
        })

        it.each(
            Object.values(TicketSearchSortableProperties).reduce(
                (acc, orderBy) => [
                    ...acc,
                    [orderBy, OrderDirection.Asc],
                    [orderBy, OrderDirection.Desc],
                ],
                [] as [TicketSearchSortableProperties, OrderDirection][]
            )
        )(
            'should construct order_by param for %s %s',
            async (orderBy, orderDir) => {
                await searchTickets({
                    search: 'foo',
                    orderBy,
                    orderDir,
                })

                expect(mockedServer.history.post[0].params).toEqual({
                    order_by: `${orderBy}:${orderDir}`,
                })
            }
        )

        it('should cancel the request on cancel token cancel', async () => {
            const source = axios.CancelToken.source()
            source.cancel()

            const res = searchTickets({
                search: '',
                cancelToken: source.token,
            })

            await expect(res).rejects.toBeInstanceOf(axios.Cancel)
        })
    })
})
