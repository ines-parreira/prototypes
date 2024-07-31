import {renderHook} from '@testing-library/react-hooks'
import {JobType} from '@gorgias/api-queries'
import {POSITIONS} from 'reapop'

import {NotificationStatus, NotificationStyle} from 'state/notifications/types'

import useNotificationPayload from '../useNotificationPayload'

jest.mock('reapop')

describe('useBulkAction', () => {
    it('should return with a notification payload', () => {
        const {result} = renderHook(() =>
            useNotificationPayload({
                jobType: JobType.DeleteTicket,
                level: 'view',
                objectType: 'tickets',
            })
        )

        expect(result.current).toMatchObject(
            expect.objectContaining({
                id: expect.stringContaining('notification-'),
                buttons: [],
                allowHTML: false,
                closeButton: false,
                closeOnNext: true,
                dismissAfter: 10000,
                dismissible: true,
                message: expect.any(String),
                position: POSITIONS.topCenter,
                status: NotificationStatus.Loading,
                style: NotificationStyle.Alert,
            })
        )
    })
})
