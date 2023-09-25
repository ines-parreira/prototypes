import React from 'react'
import MockAdapter from 'axios-mock-adapter'
import {renderHook} from '@testing-library/react-hooks'
import {QueryClientProvider} from '@tanstack/react-query'

import client from 'models/api/resources'
import {createTestQueryClient} from 'tests/reactQueryTestingUtils'
import {useGetViewItems} from 'models/view/queries'
import {ticket} from 'fixtures/ticket'
import {apiListCursorPaginationResponse} from 'fixtures/axiosResponse'

const mockedServer = new MockAdapter(client)
const queryClient = createTestQueryClient()

const wrapper: React.FC = ({children}) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

beforeEach(() => {
    mockedServer.reset()
    queryClient.clear()
})

describe('useGetViewItems', () => {
    const viewId = 1

    it('should succeed and return proper data', async () => {
        const response = apiListCursorPaginationResponse([ticket])

        mockedServer.onGet(`/api/views/${viewId}/items/`).reply(200, response)
        const {result, waitFor} = renderHook(
            () =>
                useGetViewItems({
                    viewId,
                }),
            {
                wrapper,
            }
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data?.data).toStrictEqual(response)
    })

    it('should fail and return proper error', async () => {
        mockedServer
            .onGet(`/api/views/${viewId}/items/`)
            .reply(404, {message: 'error'})
        const {result, waitFor} = renderHook(
            () =>
                useGetViewItems({
                    viewId,
                }),
            {
                wrapper,
            }
        )

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
            expect(result.current.error).toBeDefined()
        })
    })
})
