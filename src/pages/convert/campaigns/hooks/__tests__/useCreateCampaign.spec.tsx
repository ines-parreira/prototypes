import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {QueryClientProvider} from '@tanstack/react-query'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import {
    campaignKeys,
    useCreateCampaign as usePureCreateCampaign,
} from 'models/convert/campaign/queries'
import {assumeMock} from 'utils/testing'

import {campaign, campaignId} from 'fixtures/campaign'
import {channelConnectionId} from 'fixtures/channelConnection'
import {NotificationStatus} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'
import {useCreateCampaign} from '../useCreateCampaign'

const queryClient = mockQueryClient()

jest.mock('models/convert/campaign/queries')
const usePureCreateCampaignMock = assumeMock(usePureCreateCampaign)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

describe('useCreateCampaign', () => {
    beforeEach(() => {
        usePureCreateCampaignMock.mockClear()
    })

    it('should dispatch success notification on success and invalidate list and detail queries', () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')
        renderHook(() => useCreateCampaign(), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        usePureCreateCampaignMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(campaign as any),
            [undefined, campaign as any],
            undefined
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
        renderHook(() => useCreateCampaign(), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        const myError = {}
        usePureCreateCampaignMock.mock.calls[0][0]?.onError!(
            myError,
            [undefined, campaign as any],
            undefined
        )

        expect(notify).toHaveBeenCalledWith({
            message: 'Failed to create the campaign',
            status: NotificationStatus.Error,
        })
    })
})
