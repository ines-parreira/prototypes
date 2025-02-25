import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { campaign, campaignId } from 'fixtures/campaign'
import { channelConnectionId } from 'fixtures/channelConnection'
import {
    campaignKeys,
    useUpdateCampaign as usePureUpdateCampaign,
} from 'models/convert/campaign/queries'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import { useUpdateCampaign } from '../useUpdateCampaign'

const queryClient = mockQueryClient()

jest.mock('models/convert/campaign/queries')
const usePureUpdateCampaignMock = assumeMock(usePureUpdateCampaign)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

describe('useUpdateCampaign', () => {
    beforeEach(() => {
        usePureUpdateCampaignMock.mockClear()
    })

    it('should dispatch success notification on success and invalidate list and detail queries', () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')
        renderHook(() => useUpdateCampaign(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        usePureUpdateCampaignMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(campaign as any),
            [undefined, { campaign_id: campaignId }, campaign as any],
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
        renderHook(() => useUpdateCampaign(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        const myError = {}
        usePureUpdateCampaignMock.mock.calls[0][0]?.onError!(
            myError,
            [undefined, { campaign_id: campaignId }, campaign as any],
            undefined,
        )

        expect(notify).toHaveBeenCalledWith({
            message: 'Failed to update the campaign',
            status: NotificationStatus.Error,
        })
    })
})
