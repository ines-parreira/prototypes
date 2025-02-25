import React from 'react'

import { render } from '@testing-library/react'
import NotificationsSystem, { dismissNotification } from 'reapop'

import useAppDispatch from 'hooks/useAppDispatch'
import { NotificationIcon } from 'pages/common/components/NotificationIcon'

import useAlertNotifications from '../../hooks/useAlertNotifications'
import AlertNotifications from '../AlertNotifications'

jest.mock('reapop', () => ({
    __esModule: true,
    default: jest.fn(),
    dismissNotification: jest.fn(),
}))
jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('pages/common/components/NotificationIcon', () => ({
    NotificationIcon: jest.fn(),
}))
jest.mock('pages/common/components/Notifications', () => ({}))
jest.mock('../../hooks/useAlertNotifications', () => jest.fn())

const dismissNotificationMock = dismissNotification as jest.Mock
const NotificationsSystemMock = NotificationsSystem as jest.Mock
const useAlertNotificationsMock = useAlertNotifications as jest.Mock
const useAppDispatchMock = useAppDispatch as jest.Mock

describe('AlertNotifications', () => {
    let dispatch: jest.Mock

    beforeEach(() => {
        jest.resetAllMocks()

        NotificationsSystemMock.mockReturnValue(<div>NotificationsSystem</div>)
        useAlertNotificationsMock.mockReturnValue([
            { style: 'banner', id: 1 },
            { style: 'banner', id: 2 },
        ])

        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
    })

    it('should render alert notifications', () => {
        const { getByText } = render(<AlertNotifications />)

        expect(NotificationsSystem).toHaveBeenCalledWith(
            {
                components: { NotificationIcon },
                dismissNotification: expect.any(Function),
                notifications: [
                    { style: 'banner', id: 1 },
                    { style: 'banner', id: 2 },
                ],
                theme: {},
            },
            expect.any(Object),
        )
        expect(getByText('NotificationsSystem')).toBeInTheDocument()
    })

    it('should dismiss a notification', () => {
        render(<AlertNotifications />)

        const { dismissNotification } = (
            NotificationsSystemMock.mock.calls as [
                [{ dismissNotification: (id: number) => void }],
            ]
        )[0][0]

        dismissNotification(123)
        expect(dismissNotificationMock).toHaveBeenCalledWith(123)
    })
})
