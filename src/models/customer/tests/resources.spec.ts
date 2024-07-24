import axios from 'axios'

import MockAdapter from 'axios-mock-adapter'

import {searchCustomers as apiSearchCustomers} from '@gorgias/api-client'
import client from 'models/api/resources'

import {customer} from 'fixtures/customer'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {Customer} from 'models/customer/types'
import {CustomerWithHighlightsResponse} from 'models/search/types'
import {assumeMock} from 'utils/testing'

import {
    getCustomer,
    searchCustomers,
    searchCustomersWithHighlights,
} from 'models/customer/resources'

const mockedServer = new MockAdapter(client)

jest.mock('@gorgias/api-client')
const apiSearchCustomersMock = assumeMock(apiSearchCustomers)

describe('Customer resources', () => {
    describe('searchCustomers', () => {
        const defaultData: ApiListResponseCursorPagination<Customer[]> = {
            data: [customer],
            meta: {
                next_cursor: null,
                prev_cursor: null,
            },
            object: 'list',
            uri: '/api/customers/search',
        }

        beforeEach(() => {
            apiSearchCustomersMock.mockResolvedValue({data: defaultData} as any)
            mockedServer.reset()
            mockedServer
                .onGet(`/api/customers/${customer.id}`)
                .reply(201, defaultData)
        })

        it('should resolve with the customer list and meta on success', async () => {
            const res = await searchCustomers({
                search: '',
            })

            expect(res.data).toEqual(defaultData)
        })

        it('should pass the search phrase in the payload', async () => {
            const options = {
                search: 'foo',
            }

            await searchCustomers(options)

            expect(apiSearchCustomersMock).toHaveBeenCalledWith(options, {}, {})
        })

        it('should pass cursor and limit in the params', async () => {
            const cursor = 'some_cursor'
            const limit = 10

            await searchCustomers({
                search: 'foo',
                cursor,
                limit,
            })

            expect(apiSearchCustomersMock).toHaveBeenCalledWith(
                {search: 'foo'},
                {cursor, limit},
                {}
            )
        })

        it('should cancel the request on cancel token cancel', async () => {
            const source = axios.CancelToken.source()
            source.cancel()

            await searchCustomers({
                search: '',
                cancelToken: source.token,
            })

            expect(apiSearchCustomersMock).toHaveBeenCalledWith(
                {search: ''},
                {},
                {cancelToken: source.token}
            )
        })

        it('should add with_highlights prop', async () => {
            const options = {
                search: 'foo',
                withHighlights: true,
            }

            await searchCustomers(options)

            expect(apiSearchCustomersMock).toHaveBeenCalledWith(
                {search: 'foo'},
                {
                    with_highlights: options.withHighlights,
                },
                {}
            )
        })
    })

    describe('searchCustomersWithHighlights', () => {
        const customerHighlights = {}
        const defaultData: ApiListResponseCursorPagination<
            CustomerWithHighlightsResponse[]
        > = {
            data: [{entity: customer, highlights: customerHighlights}],
            meta: {
                next_cursor: null,
                prev_cursor: null,
            },
            object: 'list',
            uri: '/api/customers/search',
        }

        it('should call searchCustomers withHighlights and merge Customers with their highlights', async () => {
            const options = {search: 'foo'}
            apiSearchCustomersMock.mockResolvedValue({data: defaultData} as any)

            const response = await searchCustomersWithHighlights(options)

            expect(apiSearchCustomersMock).toHaveBeenCalledWith(
                {
                    ...options,
                },
                {with_highlights: true},
                {}
            )

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
            const source = axios.CancelToken.source()
            source.cancel()

            const res = getCustomer(customer.id, source.token)

            await expect(res).rejects.toBeInstanceOf(axios.Cancel)
        })
    })
})
