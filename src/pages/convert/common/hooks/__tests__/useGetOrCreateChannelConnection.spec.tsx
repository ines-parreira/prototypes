import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {QueryClientProvider} from '@tanstack/react-query'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'
import {channelConnection} from 'fixtures/channelConnection'
import {IntegrationType} from 'models/integration/constants'
import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import {
    useCreateChannelConnection,
    useListChannelConnections,
} from 'models/convert/channelConnection/queries'
import {useGetOrCreateChannelConnection} from '../useGetOrCreateChannelConnection'

jest.mock('models/convert/channelConnection/queries')
const useListChannelConnectionsSpy = assumeMock(useListChannelConnections)
const useCreateChannelConnectionSpy = assumeMock(useCreateChannelConnection)

const queryClient = mockQueryClient()

const wrapper = ({children}: any) => (
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

        const {result} = renderHook(
            () =>
                useGetOrCreateChannelConnection({
                    meta: {
                        app_id: channelConnection.external_id,
                        shop_type: IntegrationType.Shopify,
                        shop_integration_id:
                            channelConnection.store_integration_id,
                    },
                } as any),
            {wrapper}
        )

        useListChannelConnectionsSpy.mock.calls[0][1]?.onSuccess!(
            axiosSuccessResponse([channelConnection]) as any
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
            data: channelConnection,
            isLoading: false,
            isError: false,
        } as any)

        const {result} = renderHook(
            () =>
                useGetOrCreateChannelConnection({
                    meta: {
                        app_id: channelConnection.external_id,
                        shop_type: IntegrationType.Shopify,
                        shop_integration_id:
                            channelConnection.store_integration_id,
                    },
                } as any),
            {wrapper}
        )

        useListChannelConnectionsSpy.mock.calls[0][1]?.onSuccess!(
            axiosSuccessResponse([]) as any
        )

        expect(useListChannelConnectionsSpy).toHaveBeenCalled()
        expect(mutateSpy).toHaveBeenCalled()

        expect(result.current.channelConnection).toEqual(channelConnection)
        expect(result.current.isLoading).toBeFalsy()
        expect(result.current.isError).toBeFalsy()
    })
})
