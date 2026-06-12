import client from '@repo/api-resources'
import MockAdapter from 'axios-mock-adapter'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockSearchCustomersHandler } from '@gorgias/helpdesk-mocks'

import { customer } from 'fixtures/customer'
import type { ApiListResponseCursorPagination } from 'models/api/types'
import {
    getCustomer,
    searchCustomers,
    searchCustomersWithHighlights,
} from 'models/customer/resources'
import type { Customer } from 'models/customer/types'
import type { CustomerWithHighlightsResponse } from 'models/search/types'
import { Cancel, CancelToken } from 'tests/axiosRuntime'

const mockedServer = new MockAdapter(client)
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

describe('Customer resources', () => {
    describe('searchCustomers', () => {
        const defaultData: ApiListResponseCursorPagination<Customer[]> = {
            data: [customer],
            meta: {
                next_cursor: null,
                prev_cursor: null,
                total_resources: null,
            },
            object: 'list',
            uri: '/api/customers/search',
        }

        beforeEach(() => {
            mockedServer.reset()
            mockedServer
                .onGet(`/api/customers/${customer.id}`)
                .reply(201, defaultData)
        })

        it('should resolve with the customer list and meta on success', async () => {
            server.use(
                mockSearchCustomersHandler(async () =>
                    HttpResponse.json(defaultData as any),
                ).handler,
            )

            const res = await searchCustomers({
                search: '',
            })

            expect(res.data).toEqual(defaultData)
        })

        it('should pass the search phrase in the payload', async () => {
            const searchCustomersMock = mockSearchCustomersHandler()
            const waitForSearchCustomersRequest =
                searchCustomersMock.waitForRequest(server)
            server.use(searchCustomersMock.handler)
            const options = {
                search: 'foo',
            }

            await searchCustomers(options)

            await waitForSearchCustomersRequest(async (request) => {
                expect(await request.json()).toEqual(options)
                expect(new URL(request.url).search).toBe('')
            })
        })

        it('should pass cursor and limit in the params', async () => {
            const searchCustomersMock = mockSearchCustomersHandler()
            const waitForSearchCustomersRequest =
                searchCustomersMock.waitForRequest(server)
            server.use(searchCustomersMock.handler)
            const cursor = 'some_cursor'
            const limit = 10

            await searchCustomers({
                search: 'foo',
                cursor,
                limit,
            })

            await waitForSearchCustomersRequest(async (request) => {
                const searchParams = new URL(request.url).searchParams

                expect(await request.json()).toEqual({ search: 'foo' })
                expect(searchParams.get('cursor')).toBe(cursor)
                expect(searchParams.get('limit')).toBe(String(limit))
            })
        })

        it('should cancel the request on cancel token cancel', async () => {
            const source = CancelToken.source()
            source.cancel()

            await expect(
                searchCustomers({
                    search: '',
                    cancelToken: source.token,
                }),
            ).rejects.toBeInstanceOf(Cancel)
        })

        it('should add with_highlights prop', async () => {
            const searchCustomersMock = mockSearchCustomersHandler()
            const waitForSearchCustomersRequest =
                searchCustomersMock.waitForRequest(server)
            server.use(searchCustomersMock.handler)
            const options = {
                search: 'foo',
                withHighlights: true,
            }

            await searchCustomers(options)

            await waitForSearchCustomersRequest(async (request) => {
                const searchParams = new URL(request.url).searchParams

                expect(await request.json()).toEqual({ search: 'foo' })
                expect(searchParams.get('with_highlights')).toBe('true')
            })
        })
    })

    describe('searchCustomersWithHighlights', () => {
        const customerHighlights = {}
        const defaultData: ApiListResponseCursorPagination<
            CustomerWithHighlightsResponse[]
        > = {
            data: [{ entity: customer, highlights: customerHighlights }],
            meta: {
                next_cursor: null,
                prev_cursor: null,
                total_resources: null,
            },
            object: 'list',
            uri: '/api/customers/search',
        }

        it('should call searchCustomers withHighlights and merge Customers with their highlights', async () => {
            const searchCustomersMock = mockSearchCustomersHandler(async () =>
                HttpResponse.json(defaultData as any),
            )
            const waitForSearchCustomersRequest =
                searchCustomersMock.waitForRequest(server)
            server.use(searchCustomersMock.handler)
            const options = { search: 'foo' }

            const response = await searchCustomersWithHighlights(options)

            await waitForSearchCustomersRequest(async (request) => {
                const searchParams = new URL(request.url).searchParams

                expect(await request.json()).toEqual(options)
                expect(searchParams.get('with_highlights')).toBe('true')
            })

            expect(response.data.data).toEqual([
                {
                    ...customer,
                    highlights: customerHighlights,
                },
            ])
        })
    })

    describe('getCustomer', () => {
        const defaultData = {
            data: customer,
            uri: `/api/customers/${customer.id}`,
        }

        beforeEach(() => {
            mockedServer.reset()
            mockedServer
                .onGet(`/api/customers/${customer.id}`)
                .reply(201, defaultData)
        })

        it('should resolve with the customer data on success', async () => {
            const res = await getCustomer(customer.id)

            expect(res.data).toEqual(defaultData)
        })

        it('should cancel the request on cancel token cancel', async () => {
            const source = CancelToken.source()
            source.cancel()

            const res = getCustomer(customer.id, source.token)

            await expect(res).rejects.toBeInstanceOf(Cancel)
        })
    })
})
