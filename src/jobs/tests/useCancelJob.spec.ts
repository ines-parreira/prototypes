import { POSITIONS } from 'reapop'

import { useCancelJob as useCancelJobQuery } from '@gorgias/helpdesk-queries'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { notify } from 'state/notifications/actions'
import {
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import useCancelJob from '../useCancelJob'

jest.mock('reapop')

jest.mock('@gorgias/helpdesk-queries')
const useCancelJobMock = assumeMock(useCancelJobQuery)

jest.mock('state/notifications/actions')

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

const mutateCancelJobMock = jest.fn()
const cancelJobResponse = () =>
    ({
        mutate: mutateCancelJobMock,
    }) as unknown as ReturnType<typeof useCancelJobQuery>

describe('useBulkAction', () => {
    useCancelJobMock.mockReturnValue(cancelJobResponse())
    const notificationPayload = {
        id: 'id',
        buttons: [],
        allowHTML: false,
        closeButton: false,
        closeOnNext: true,
        dismissAfter: 10000,
        dismissible: true,
        message: 'Job launched',
        position: POSITIONS.topCenter,
        status: NotificationStatus.Loading,
        style: NotificationStyle.Alert as const,
    }

    it('should successfully cancel job', () => {
        const { result } = renderHook(() =>
            useCancelJob({
                getNotificationPayload: () => notificationPayload,
            }),
        )
        void result.current.cancelJob({ id: 1 })
        useCancelJobMock.mock.calls[0][0]?.mutation?.onSuccess?.(
            axiosSuccessResponse(undefined),
            {
                id: 1,
            },
            undefined,
        )

        expect(notify).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'The job has been canceled.',
                status: NotificationStatus.Success,
            }),
        )
    })

    it('should handle failure on job cancellation', () => {
        const { result } = renderHook(() =>
            useCancelJob({
                getNotificationPayload: () => notificationPayload,
            }),
        )
        void result.current.cancelJob({ id: 1 })
        useCancelJobMock.mock.calls[0][0]?.mutation?.onError?.(
            {
                response: {
                    status: 403,
                    data: { error: { msg: 'Unauthorized' } },
                },
            },
            {
                id: 1,
            },
            undefined,
        )

        expect(notify).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Unauthorized',
                status: NotificationStatus.Error,
            }),
        )
    })
})
