import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act } from '@testing-library/react-hooks'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { channelConnectionId } from 'fixtures/channelConnection'
import * as queries from 'models/convert/settings/queries'
import {
    getSettingsList,
    updateSettings,
} from 'models/convert/settings/resources'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('pages/convert/common/hooks/useConvertApi', () => ({
    useConvertApi: jest.fn(() => ({
        client: jest.fn(),
    })),
}))

jest.mock('models/convert/settings/resources')

const mockedResources = {
    mockUpdateSettings: assumeMock(updateSettings),
    mockGetSettingList: assumeMock(getSettingsList),
}

const queryClient = mockQueryClient()

const wrapper = ({ children }: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('Convert settings queries', () => {
    const testOverrides = {
        staleTime: 0,
        cacheTime: 0,
        retry: 0,
    }

    beforeEach(() => {
        queryClient.clear()
    })

    describe('useGetSettingsList', () => {
        it('should return correct data on success', async () => {
            mockedResources.mockGetSettingList.mockResolvedValueOnce({
                data: [{ type: 'setting_type', data: { foo: 'bar' } }],
            } as any)

            const { result, waitFor } = renderHook(
                () =>
                    queries.useGetSettingsList(
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
            expect(result.current.data).toStrictEqual([
                { type: 'setting_type', data: { foo: 'bar' } },
            ])
        })

        it('should return expected error on failure', async () => {
            mockedResources.mockGetSettingList.mockRejectedValueOnce(
                Error('test error'),
            )
            const { result, waitFor } = renderHook(
                () =>
                    queries.useGetSettingsList(
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
            const { waitFor } = renderHook(
                () =>
                    queries.useGetSettingsList(
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
                    mockedResources.mockGetSettingList,
                ).not.toHaveBeenCalled(),
            )
        })
    })

    describe('useUpdateSetting', () => {
        it('return correct data on success', async () => {
            mockedResources.mockUpdateSettings.mockResolvedValueOnce(
                axiosSuccessResponse({ type: 'test', data: { foo: 1 } }) as any,
            )
            const { result, waitFor } = renderHook(
                () => queries.useUpdateSetting(),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    ),
                },
            )
            act(() => {
                result.current.mutate([
                    {
                        channel_connection_id: channelConnectionId,
                    },
                ] as any)
            })
            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })
            expect(result.current.data?.data).toEqual({
                type: 'test',
                data: { foo: 1 },
            })
        })
    })
})
