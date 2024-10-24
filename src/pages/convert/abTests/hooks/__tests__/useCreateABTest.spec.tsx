import {QueryClientProvider} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import React from 'react'

import {abTest} from 'fixtures/abTest'
import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import {
    useCreateABTest as usePureCreateABTest,
    abTestKeys,
} from 'models/convert/abTest/queries'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

import {useCreateABTest} from '../useCreateABTest'

const queryClient = mockQueryClient()

jest.mock('models/convert/abTest/queries')
const usePureCreateABTestMock = assumeMock(usePureCreateABTest)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

describe('useCreateABTest', () => {
    beforeEach(() => {
        usePureCreateABTestMock.mockClear()
    })

    it('should dispatch success notification on success and invalidate list query', () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')

        renderHook(() => useCreateABTest(), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        usePureCreateABTestMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(abTest as any),
            [undefined, abTest as any],
            undefined
        )

        expect(invalidateQueryMock).toHaveBeenCalledWith({
            queryKey: abTestKeys.lists(),
        })

        expect(notify).toHaveBeenCalledWith({
            message: 'A/B Test successfully started',
            status: NotificationStatus.Success,
        })
    })

    it('should call handleError on error', () => {
        renderHook(() => useCreateABTest(), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        const myError = {}
        usePureCreateABTestMock.mock.calls[0][0]?.onError!(
            myError,
            [undefined, abTest as any],
            undefined
        )

        expect(notify).toHaveBeenCalledWith({
            message: 'Failed to start the A/B Test',
            status: NotificationStatus.Error,
        })
    })
})
