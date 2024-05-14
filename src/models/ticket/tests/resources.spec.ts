import axios from 'axios'

import {searchTickets as apiSearchTickets} from '@gorgias/api-client'
import {ticket} from 'fixtures/ticket'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {Ticket} from 'models/ticket/types'
import {searchTickets} from 'models/ticket/resources'
import {assumeMock} from 'utils/testing'

jest.mock('@gorgias/api-client')
const searchTicketsMock = assumeMock(apiSearchTickets)

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
            searchTicketsMock.mockResolvedValue({data: defaultData} as any)
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
                {cursor, limit},
                {}
            )
        })

        it('should pass cancel token', async () => {
            const source = axios.CancelToken.source()
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
                {cancelToken: source.token}
            )
        })

        it('should add with_highlights prop', async () => {
            const options = {
                search: 'foo',
            }
            const params = {
                withHighlights: true,
            }

            await searchTickets({...options, ...params})

            expect(searchTicketsMock).toHaveBeenCalledWith(
                {...options, filters: ''},
                {with_highlights: params.withHighlights},
                {}
            )
        })
    })
})
