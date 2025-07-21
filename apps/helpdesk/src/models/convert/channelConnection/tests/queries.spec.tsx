import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import {
    channelConnection,
    channelConnectionId,
} from 'fixtures/channelConnection'
import {
    ChannelConnectionCreatePayload,
    ChannelConnectionListOptions,
    ChannelConnectionParams,
    ChannelConnectionUpdatePayload,
} from 'models/convert/channelConnection/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import * as queries from '../queries'
import * as resources from '../resources'

jest.mock('pages/convert/common/hooks/useConvertApi', () => ({
    useConvertApi: jest.fn(() => ({
        client: jest.fn(),
    })),
}))

jest.mock('../resources', () => ({
    getChannelConnection: jest.fn(),
    listChannelConnections: jest.fn(),
    createChannelConnection: jest.fn(),
    updateChannelConnection: jest.fn(),
    deleteChannelConnection: jest.fn(),
}))

const mockedResources = {
    mockGetChannelConnection: assumeMock(resources.getChannelConnection),
    mockListChannelConnections: assumeMock(resources.listChannelConnections),
    mockCreateChannelConnection: assumeMock(resources.createChannelConnection),
    mockUpdateChannelConnection: assumeMock(resources.updateChannelConnection),
    mockDeleteChannelConnection: assumeMock(resources.deleteChannelConnection),
}

const queryClient = mockQueryClient()

const wrapper = ({ children }: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('Channel Connection queries', () => {
    const testOverrides = {
        staleTime: 0,
        cacheTime: 0,
        retry: 0,
    }

    beforeEach(() => {
        queryClient.clear()
    })

    describe('useGetChannelConnection', () => {
        it('should return correct data on success', async () => {
            mockedResources.mockGetChannelConnection.mockResolvedValueOnce({
                data: channelConnection,
            } as any)
            const { result } = renderHook(
                () =>
                    queries.useGetChannelConnection(
                        {
                            channel_connection_id: channelConnectionId,
                        },
                        testOverrides,
                    ),
                {
                    wrapper,
                },
            )
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual(channelConnection)
        })

        it('should return expected error on failure', async () => {
            mockedResources.mockGetChannelConnection.mockRejectedValueOnce(
                Error('test error'),
            )
            const { result } = renderHook(
                () =>
                    queries.useGetChannelConnection(
                        {
                            channel_connection_id: channelConnectionId,
                        },
                        testOverrides,
                    ),
                {
                    wrapper,
                },
            )
            await waitFor(() => expect(result.current.isError).toBe(true))
            expect(result.current.error).toStrictEqual(Error('test error'))
        })

        it('should respect the enabled setting', async () => {
            renderHook(
                () =>
                    queries.useGetChannelConnection(
                        {
                            channel_connection_id: channelConnectionId,
                        },
                        { ...testOverrides, enabled: false },
                    ),
                {
                    wrapper,
                },
            )
            await waitFor(() =>
                expect(
                    mockedResources.mockGetChannelConnection,
                ).not.toHaveBeenCalled(),
            )
        })
    })

    describe('useListChannelConnections', () => {
        const options: ChannelConnectionListOptions = {
            storeIntegrationId: 1,
            externalId: 'test-ext-id',
            channel: 'widget',
        }

        it('should return correct data on success', async () => {
            mockedResources.mockListChannelConnections.mockResolvedValueOnce({
                data: [channelConnection],
            } as any)

            const { result } = renderHook(
                () => queries.useListChannelConnections(options),
                {
                    wrapper,
                },
            )
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual([channelConnection])
        })

        it('should return expected error on failure', async () => {
            mockedResources.mockListChannelConnections.mockRejectedValueOnce(
                Error('test error'),
            )
            const { result } = renderHook(
                () => queries.useListChannelConnections(options, testOverrides),
                {
                    wrapper,
                },
            )
            await waitFor(() => expect(result.current.isError).toBe(true))
            expect(result.current.error).toStrictEqual(Error('test error'))
        })

        it('should respect the enabled setting', async () => {
            renderHook(
                () =>
                    queries.useListChannelConnections(options, {
                        ...testOverrides,
                        enabled: false,
                    }),
                {
                    wrapper,
                },
            )
            await waitFor(() =>
                expect(
                    mockedResources.mockListChannelConnections,
                ).not.toHaveBeenCalled(),
            )
        })
    })

    describe('Channel connection mutations: ', () => {
        const id = {
            channel_connection_id: channelConnectionId,
        } as ChannelConnectionParams

        it.each([
            [
                'useCreateChannelConnection',
                'mockCreateChannelConnection',
                undefined,
                channelConnection as ChannelConnectionCreatePayload,
            ],
            [
                'useUpdateChannelConnection',
                'mockUpdateChannelConnection',
                id,
                channelConnection as ChannelConnectionUpdatePayload,
            ],
            [
                'useDeleteChannelConnection',
                'mockDeleteChannelConnection',
                id,
                undefined,
            ],
        ] as const)(
            '%s return correct data on success',
            async (hook, mockedResource, param, returnedData) => {
                mockedResources[mockedResource].mockResolvedValueOnce(
                    axiosSuccessResponse(returnedData) as any,
                )
                const { result } = renderHook(() => queries[hook](), {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    ),
                })

                act(() => {
                    result.current.mutate([param as any] as any)
                })

                await waitFor(() => {
                    expect(result.current.isSuccess).toBe(true)
                })
                expect(result.current.data?.data).toEqual(returnedData)
            },
        )
    })
})
