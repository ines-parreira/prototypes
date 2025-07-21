import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { campaign, campaignId } from 'fixtures/campaign'
import { channelConnectionId } from 'fixtures/channelConnection'
import {
    campaignKeys,
    useDeleteCampaign as usePureDeleteCampaign,
} from 'models/convert/campaign/queries'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useDeleteCampaign } from '../useDeleteCampaign'

const queryClient = mockQueryClient()

jest.mock('models/convert/campaign/queries')
const usePureDeleteCampaignMock = assumeMock(usePureDeleteCampaign)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

describe('useDeleteCampaign', () => {
    beforeEach(() => {
        usePureDeleteCampaignMock.mockClear()
    })

    it('should dispatch success notification on success and invalidate list and detail queries', () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')
        renderHook(() => useDeleteCampaign(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        usePureDeleteCampaignMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(campaign as any),
            [undefined, { campaign_id: campaignId }],
            undefined,
        )

        expect(invalidateQueryMock).toHaveBeenCalledWith({
            queryKey: campaignKeys.list({
                channelConnectionId: channelConnectionId,
            }),
        })
        expect(invalidateQueryMock).toHaveBeenCalledWith({
            queryKey: campaignKeys.detail({
                campaign_id: campaignId,
            }),
        })
    })

    it('should call handleError on error', () => {
        renderHook(() => useDeleteCampaign(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        const myError = {}
        usePureDeleteCampaignMock.mock.calls[0][0]?.onError!(
            myError,
            [undefined, { campaign_id: campaignId }],
            undefined,
        )

        expect(notify).toHaveBeenCalledWith({
            message: 'Failed to delete the campaign',
            status: NotificationStatus.Error,
        })
    })
})
