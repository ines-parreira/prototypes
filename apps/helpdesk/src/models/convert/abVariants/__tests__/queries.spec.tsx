import React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'

import { abGroup, campaignId } from 'fixtures/abGroup'
import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import * as queries from '../queries'
import * as resources from '../resources'
import { ABVariantParams } from '../types'

jest.mock('pages/convert/common/hooks/useConvertApi', () => ({
    useConvertApi: jest.fn(() => ({
        client: jest.fn(),
    })),
}))

jest.mock('../resources', () => ({
    createABGroup: jest.fn(),
    stopABGroup: jest.fn(),
    pauseABGroup: jest.fn(),
    startABGroup: jest.fn(),
}))

const mockedResources = {
    mockCreateABGroup: assumeMock(resources.createABGroup),
    mockStopABGroup: assumeMock(resources.stopABGroup),
    mockStartABGroup: assumeMock(resources.startABGroup),
    mockPauseABGroup: assumeMock(resources.pauseABGroup),
}

const queryClient = mockQueryClient()

describe('A/B Group queries', () => {
    beforeEach(() => {
        queryClient.clear()
    })

    describe('A/B group mutations: ', () => {
        const params = {
            campaign_id: campaignId,
        } as ABVariantParams

        it.each([
            [
                'useCreateABGroup',
                'mockCreateABGroup',
                params,
                undefined,
                abGroup,
            ],
            ['useStartABGroup', 'mockStartABGroup', params, undefined, abGroup],
            ['usePauseABGroup', 'mockPauseABGroup', params, undefined, abGroup],
            [
                'useStopABGroup',
                'mockStopABGroup',
                params,
                { winner_variant_id: '1' },
                abGroup,
            ],
        ] as const)(
            '%s return correct data on success',
            async (
                hook,
                mockedResource,
                param,
                requestPayload,
                returnedData,
            ) => {
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
                    let requestData = [param] as any
                    if (requestPayload) {
                        requestData = [param, requestPayload] as any
                    }
                    // @ts-ignore-next-line
                    result.current.mutate(requestData)
                })

                await waitFor(() => {
                    expect(result.current.isSuccess).toBe(true)
                })
                expect(result.current.data?.data).toEqual(returnedData)
            },
        )
    })
})
