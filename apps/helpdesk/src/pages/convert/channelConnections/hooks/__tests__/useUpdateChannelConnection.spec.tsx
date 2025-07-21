import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { channelConnection } from 'fixtures/channelConnection'
import {
    channelConnectionKeys,
    useUpdateChannelConnection as usePureUpdateChannelConnection,
} from 'models/convert/channelConnection/queries'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useUpdateChannelConnection } from '../useUpdateChannelConnection'

const queryClient = mockQueryClient()

jest.mock('models/convert/channelConnection/queries')
const usePureUpdateChannelConnectionMock = assumeMock(
    usePureUpdateChannelConnection,
)

describe('useUpdateChannelConnection', () => {
    beforeEach(() => {
        usePureUpdateChannelConnectionMock.mockClear()
    })

    it('should invalidate lists queries', () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')
        renderHook(() => useUpdateChannelConnection(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        usePureUpdateChannelConnectionMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(channelConnection as any),
            [
                undefined,
                { channel_connection_id: channelConnection.id },
                channelConnection as any,
            ],
            undefined,
        )

        expect(invalidateQueryMock).toHaveBeenLastCalledWith({
            queryKey: channelConnectionKeys.lists(),
        })
    })
})
