import React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'

import { abTest, abTestId } from 'fixtures/abTest'
import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import {
    abTestKeys,
    useUpdateABTest as usePureUpdateABTest,
} from 'models/convert/abTest/queries'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import { useUpdateABTest } from '../useUpdateABTest'

const queryClient = mockQueryClient()

jest.mock('models/convert/abTest/queries')
const usePureUpdateABTestMock = assumeMock(usePureUpdateABTest)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

describe('useUpdateABTest', () => {
    beforeEach(() => {
        usePureUpdateABTestMock.mockClear()
    })

    it('should dispatch success notification on success and invalidate list query', () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')

        renderHook(() => useUpdateABTest(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        usePureUpdateABTestMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(abTest as any),
            [undefined, { ab_test_id: abTestId }, abTest as any],
            undefined,
        )

        expect(invalidateQueryMock).toHaveBeenCalledWith({
            queryKey: abTestKeys.lists(),
        })

        expect(notify).toHaveBeenCalledWith({
            message: 'A/B Test successfully updated',
            status: NotificationStatus.Success,
        })
    })

    it('should call handleError on error', () => {
        renderHook(() => useUpdateABTest(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        const myError = {}
        usePureUpdateABTestMock.mock.calls[0][0]?.onError!(
            myError,
            [undefined, { ab_test_id: abTestId }, abTest as any],
            undefined,
        )

        expect(notify).toHaveBeenCalledWith({
            message: 'Failed to update the A/B Test',
            status: NotificationStatus.Error,
        })
    })
})
