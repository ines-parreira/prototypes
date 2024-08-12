import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {QueryClientProvider} from '@tanstack/react-query'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import {campaignKeys} from 'models/convert/campaign/queries'
import {useCreateABGroup as usePureCreateABGroup} from 'models/convert/abVariants/queries'
import {assumeMock} from 'utils/testing'

import {campaign, campaignId} from 'fixtures/campaign'
import {NotificationStatus} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'
import {useCreateABGroup} from '../useCreateABGroup'

const queryClient = mockQueryClient()

jest.mock('models/convert/abVariants/queries')
const usePureCreateCampaignMock = assumeMock(usePureCreateABGroup)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

describe('usePauseABGroup', () => {
    beforeEach(() => {
        usePureCreateCampaignMock.mockClear()
    })

    it('should dispatch success notification on success and invalidate detail queries', () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')
        renderHook(() => useCreateABGroup(), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        usePureCreateCampaignMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(campaign as any),
            [undefined, {campaign_id: campaign.id}],
            undefined
        )

        expect(invalidateQueryMock).toHaveBeenCalledWith({
            queryKey: campaignKeys.detail({
                campaign_id: campaignId,
            }),
        })
    })

    it('should call handleError on error', () => {
        renderHook(() => useCreateABGroup(), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        const myError = {}
        usePureCreateCampaignMock.mock.calls[0][0]?.onError!(
            myError,
            [undefined, {campaign_id: campaign.id}],
            undefined
        )

        expect(notify).toHaveBeenCalledWith({
            message: 'Failed to create A/B test',
            status: NotificationStatus.Error,
        })
    })
})
