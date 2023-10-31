import React from 'react'
import MockAdapter from 'axios-mock-adapter'
import {renderHook} from '@testing-library/react-hooks'
import {QueryClientProvider} from '@tanstack/react-query'

import {
    apiListCursorPaginationResponse,
    axiosSuccessResponse,
} from 'fixtures/axiosResponse'
import {ticket} from 'fixtures/ticket'
import client from 'models/api/resources'
import {useGetViewItems} from 'models/view/queries'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import {getViewItems} from '../resources'

const mockedServer = new MockAdapter(client)
const queryClient = mockQueryClient()

const wrapper: React.FC = ({children}) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

jest.mock('models/view/resources')
const mockGetViewItems = getViewItems as jest.MockedFunction<
    typeof getViewItems
>

beforeEach(() => {
    mockedServer.reset()
    queryClient.clear()
})

describe('useGetViewItems', () => {
    const viewId = 1

    it('should succeed and return proper data', async () => {
        const response = axiosSuccessResponse(
            apiListCursorPaginationResponse([ticket])
        ) as unknown as ReturnType<typeof mockGetViewItems>
        mockGetViewItems.mockResolvedValue(response)

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

        expect(result.current.data?.pages[0]).toStrictEqual(response)
    })

    it('should fail and return proper error', async () => {
        mockGetViewItems.mockRejectedValue(Error('test error'))
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
