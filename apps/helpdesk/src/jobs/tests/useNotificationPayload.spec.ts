import { assumeMock, renderHook } from '@repo/testing'
import { POSITIONS } from 'reapop'

import { JobType } from '@gorgias/helpdesk-queries'

import {
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'
import { buildJobMessage } from 'utils/notificationUtils'

import useNotificationPayload from '../useNotificationPayload'

jest.mock('reapop')

jest.mock('utils/notificationUtils')
const buildJobMessageMock = assumeMock(buildJobMessage)

buildJobMessageMock.mockImplementation(
    (_a, _b, _c, _d, numberOfTickets) => `${numberOfTickets}`,
)

describe('useBulkAction', () => {
    it('should return with a notification payload', () => {
        const { result } = renderHook(() =>
            useNotificationPayload({
                level: 'view',
                objectType: 'tickets',
            }),
        )

        expect(result.current).toMatchObject({
            getNotificationParams: expect.any(Function),
            getNotificationPayload: expect.any(Function),
        })

        expect(
            result.current.getNotificationParams(JobType.ApplyMacro),
        ).toMatchObject(
            expect.objectContaining({
                id: expect.stringContaining('notification-'),
                message: expect.any(String),
            }),
        )

        expect(result.current.getNotificationPayload()).toMatchObject(
            expect.objectContaining({
                id: expect.stringContaining('notification-'),
                buttons: [],
                allowHTML: false,
                closeOnNext: true,
                dismissAfter: 10000,
                dismissible: true,
                message: expect.any(String),
                position: POSITIONS.topCenter,
                status: NotificationStatus.Loading,
                style: NotificationStyle.Alert,
            }),
        )
    })

    it('should return with a notification payload for ticket level', () => {
        const { result } = renderHook(() =>
            useNotificationPayload({
                level: 'ticket',
                objectType: 'tickets',
                ticketIds: [1, 2, 3],
            }),
        )

        expect(
            result.current.getNotificationParams(JobType.ApplyMacro),
        ).toMatchObject(
            expect.objectContaining({
                message: expect.stringContaining('3'),
            }),
        )
        expect(result.current.getNotificationPayload()).toMatchObject(
            expect.objectContaining({
                message: expect.stringContaining('3'),
            }),
        )
    })
})
