import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { channelConnection } from 'fixtures/channelConnection'
import {
    useCreateChannelConnection,
    useListChannelConnections,
} from 'models/convert/channelConnection/queries'
import { IntegrationType } from 'models/integration/constants'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import { useGetOrCreateChannelConnection } from '../useGetOrCreateChannelConnection'

jest.mock('models/convert/channelConnection/queries')
const useListChannelConnectionsSpy = assumeMock(useListChannelConnections)
const useCreateChannelConnectionSpy = assumeMock(useCreateChannelConnection)

const queryClient = mockQueryClient()

const wrapper = ({ children }: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('useGetOrCreateChannelConnection', () => {
    it('should fetch the channel connection and not create a new connection when existing connections are found', () => {
        useListChannelConnectionsSpy.mockReturnValue({
            data: [channelConnection],
            isLoading: false,
            isError: false,
        } as any)

        const mutateSpy = jest.fn()
        useCreateChannelConnectionSpy.mockReturnValue({
            mutate: mutateSpy,
            data: null,
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(
            () =>
                useGetOrCreateChannelConnection({
                    meta: {
                        app_id: channelConnection.external_id,
                        shop_type: IntegrationType.Shopify,
                        shop_integration_id:
                            channelConnection.store_integration_id,
                    },
                } as any),
            { wrapper },
        )

        expect(useListChannelConnectionsSpy).toHaveBeenCalled()
        expect(mutateSpy).not.toHaveBeenCalled()

        expect(result.current.channelConnection).toEqual(channelConnection)
        expect(result.current.isLoading).toBeFalsy()
        expect(result.current.isError).toBeFalsy()
    })

    it('should create a channel connection when no existing connections are found', () => {
        useListChannelConnectionsSpy.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        } as any)

        const mutateSpy = jest.fn()
        useCreateChannelConnectionSpy.mockReturnValue({
            mutate: mutateSpy,
            data: {
                ...axiosSuccessResponse(channelConnection),
                status: 201,
            },
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(
            () =>
                useGetOrCreateChannelConnection({
                    meta: {
                        app_id: channelConnection.external_id,
                        shop_type: IntegrationType.Shopify,
                        shop_integration_id:
                            channelConnection.store_integration_id,
                    },
                } as any),
            { wrapper },
        )

        act(() => {
            useListChannelConnectionsSpy.mock.calls[0][1]?.onSuccess!([] as any)
            useCreateChannelConnectionSpy.mock.calls[0][0]?.onSuccess!(
                {} as any,
                undefined as any,
                {},
            )
        })

        expect(useListChannelConnectionsSpy).toHaveBeenCalled()
        expect(mutateSpy).toHaveBeenCalled()

        expect(result.current.channelConnection).toEqual(channelConnection)
        expect(result.current.isLoading).toBeFalsy()
        expect(result.current.isError).toBeFalsy()
    })
})
