import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {QueryClientProvider} from '@tanstack/react-query'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import {campaignKeys} from 'models/convert/campaign/queries'
import {useStopABGroup as usePureStopABGroup} from 'models/convert/abVariants/queries'
import {assumeMock} from 'utils/testing'

import {campaign, campaignId} from 'fixtures/campaign'
import {NotificationStatus} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'
import {useStopABGroup} from '../useStopABGroup'

const queryClient = mockQueryClient()

jest.mock('models/convert/abVariants/queries')
const usePureStopCampaignMock = assumeMock(usePureStopABGroup)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

describe('usePauseABGroup', () => {
    beforeEach(() => {
        usePureStopCampaignMock.mockClear()
    })

    it('should dispatch success notification on success and invalidate detail queries', () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')
        renderHook(() => useStopABGroup(), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        usePureStopCampaignMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(campaign as any),
            [undefined, {campaign_id: campaign.id}, {winner_variant_id: '1'}],
            undefined
        )

        expect(invalidateQueryMock).toHaveBeenCalledWith({
            queryKey: campaignKeys.detail({
                campaign_id: campaignId,
            }),
        })
    })

    it('should call handleError on error', () => {
        renderHook(() => useStopABGroup(), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        const myError = {}
        usePureStopCampaignMock.mock.calls[0][0]?.onError!(
            myError,
            [undefined, {campaign_id: campaign.id}, {winner_variant_id: '1'}],
            undefined
        )

        expect(notify).toHaveBeenCalledWith({
            message: 'Failed to stop A/B test',
            status: NotificationStatus.Error,
        })
    })
})
