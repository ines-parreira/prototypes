import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { campaign, campaignId } from 'fixtures/campaign'
import { useStartABGroup as usePureStartABGroup } from 'models/convert/abVariants/queries'
import { campaignKeys } from 'models/convert/campaign/queries'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useStartABGroup } from '../useStartABGroup'

const queryClient = mockQueryClient()

jest.mock('models/convert/abVariants/queries')
const usePureStartCampaignMock = assumeMock(usePureStartABGroup)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

describe('usePauseABGroup', () => {
    beforeEach(() => {
        usePureStartCampaignMock.mockClear()
    })

    it('should dispatch success notification on success and invalidate detail queries', () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')
        renderHook(() => useStartABGroup(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        usePureStartCampaignMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(campaign as any),
            [undefined, { campaign_id: campaign.id }],
            undefined,
        )

        expect(invalidateQueryMock).toHaveBeenCalledWith({
            queryKey: campaignKeys.detail({
                campaign_id: campaignId,
            }),
        })
    })

    it('should call handleError on error', () => {
        renderHook(() => useStartABGroup(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        const myError = {}
        usePureStartCampaignMock.mock.calls[0][0]?.onError!(
            myError,
            [undefined, { campaign_id: campaign.id }],
            undefined,
        )

        expect(notify).toHaveBeenCalledWith({
            message: 'Failed to start A/B test',
            status: NotificationStatus.Error,
        })
    })
})
