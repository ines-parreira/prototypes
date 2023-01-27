import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import client from 'models/api/resources'
import {customer} from 'fixtures/customer'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {Customer} from 'models/customer/types'

import {searchCustomers} from '../resources'

const mockedServer = new MockAdapter(client)

describe('ticket resources', () => {
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
            mockedServer.reset()
            mockedServer.onPost('/api/customers/search').reply(201, defaultData)
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

            expect(JSON.parse(mockedServer.history.post[0].data)).toEqual(
                options
            )
        })

        it('should pass cursor and limit in the params', async () => {
            const cursor = 'some_cursor'
            const limit = 10

            await searchCustomers({
                search: 'foo',
                cursor,
                limit,
            })

            expect(mockedServer.history.post[0].params).toEqual({cursor, limit})
        })

        it('should cancel the request on cancel token cancel', async () => {
            const source = axios.CancelToken.source()
            source.cancel()

            const res = searchCustomers({
                search: '',
                cancelToken: source.token,
            })

            await expect(res).rejects.toBeInstanceOf(axios.Cancel)
        })
    })
})
