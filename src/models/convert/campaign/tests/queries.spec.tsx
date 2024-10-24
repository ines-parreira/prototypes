import {QueryClientProvider} from '@tanstack/react-query'
import {renderHook, act} from '@testing-library/react-hooks'
import React from 'react'

import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import {campaign, campaignId} from 'fixtures/campaign'
import {channelConnectionId} from 'fixtures/channelConnection'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

import * as queries from '../queries'
import * as resources from '../resources'
import {
    CampaignCreatePayload,
    CampaignParams,
    CampaignUpdatePayload,
} from '../types'

jest.mock('pages/convert/common/hooks/useConvertApi', () => ({
    useConvertApi: jest.fn(() => ({
        client: jest.fn(),
    })),
}))

jest.mock('../resources', () => ({
    getCampaign: jest.fn(),
    listCampaigns: jest.fn(),
    createCampaign: jest.fn(),
    updateCampaign: jest.fn(),
    deleteCampaign: jest.fn(),
}))

const mockedResources = {
    mockGetCampaign: assumeMock(resources.getCampaign),
    mockListCampaigns: assumeMock(resources.listCampaigns),
    mockCreateCampaign: assumeMock(resources.createCampaign),
    mockUpdateCampaign: assumeMock(resources.updateCampaign),
    mockDeleteCampaign: assumeMock(resources.deleteCampaign),
}

const queryClient = mockQueryClient()

const wrapper = ({children}: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('Campaign queries', () => {
    const testOverrides = {
        staleTime: 0,
        cacheTime: 0,
        retry: 0,
    }

    beforeEach(() => {
        queryClient.clear()
    })

    describe('useGetCampaign', () => {
        it('should return correct data on success', async () => {
            mockedResources.mockGetCampaign.mockResolvedValueOnce({
                data: campaign,
            } as any)
            const {result, waitFor} = renderHook(
                () =>
                    queries.useGetCampaign({
                        campaign_id: campaignId,
                    }),
                {
                    wrapper,
                }
            )
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual(campaign)
        })

        it('should return expected error on failure', async () => {
            mockedResources.mockGetCampaign.mockRejectedValueOnce(
                Error('test error')
            )
            const {result, waitFor} = renderHook(
                () =>
                    queries.useGetCampaign(
                        {
                            campaign_id: campaignId,
                        },
                        testOverrides
                    ),
                {
                    wrapper,
                }
            )
            await waitFor(() => expect(result.current.isError).toBe(true))
            expect(result.current.error).toStrictEqual(Error('test error'))
        })

        it('should respect the enabled setting', async () => {
            const {waitFor} = renderHook(
                () =>
                    queries.useGetCampaign(
                        {
                            campaign_id: campaignId,
                        },
                        {...testOverrides, enabled: false}
                    ),
                {
                    wrapper,
                }
            )
            await waitFor(() =>
                expect(mockedResources.mockGetCampaign).not.toHaveBeenCalled()
            )
        })
    })

    describe('useListCampaigns', () => {
        it('should return correct data on success', async () => {
            mockedResources.mockListCampaigns.mockResolvedValueOnce({
                data: [campaign],
            } as any)
            const {result, waitFor} = renderHook(
                () =>
                    queries.useListCampaigns({
                        channelConnectionId: channelConnectionId,
                    }),
                {
                    wrapper,
                }
            )
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual([campaign])
        })

        it('should return expected error on failure', async () => {
            mockedResources.mockListCampaigns.mockRejectedValueOnce(
                Error('test error')
            )
            const {result, waitFor} = renderHook(
                () =>
                    queries.useListCampaigns(
                        {
                            channelConnectionId: channelConnectionId,
                        },
                        testOverrides
                    ),
                {
                    wrapper,
                }
            )
            await waitFor(() => expect(result.current.isError).toBe(true))
            expect(result.current.error).toStrictEqual(Error('test error'))
        })

        it('should respect the enabled setting', async () => {
            const {waitFor} = renderHook(
                () =>
                    queries.useListCampaigns(
                        {
                            channelConnectionId: channelConnectionId,
                        },
                        {...testOverrides, enabled: false}
                    ),
                {
                    wrapper,
                }
            )
            await waitFor(() =>
                expect(mockedResources.mockListCampaigns).not.toHaveBeenCalled()
            )
        })
    })

    describe('Campaign mutations: ', () => {
        const id = {
            campaign_id: campaignId,
        } as CampaignParams

        it.each([
            [
                'useCreateCampaign',
                'mockCreateCampaign',
                undefined,
                campaign as any as CampaignCreatePayload,
            ],
            [
                'useUpdateCampaign',
                'mockUpdateCampaign',
                id,
                campaign as CampaignUpdatePayload,
            ],
            ['useDeleteCampaign', 'mockDeleteCampaign', id, undefined],
        ] as const)(
            '%s return correct data on success',
            async (hook, mockedResource, param, returnedData) => {
                mockedResources[mockedResource].mockResolvedValueOnce(
                    axiosSuccessResponse(returnedData) as any
                )
                const {result, waitFor} = renderHook(() => queries[hook](), {
                    wrapper: ({children}) => (
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
            }
        )
    })
})
