import { renderHook } from '@repo/testing'

import { useFlag } from 'core/flags'

import { desktopNotify } from '../../desktopNotify'
import { requestNotificationPermission } from '../../requestNotificationPermission'
import type { Notification } from '../../types'
import getNotificationConfig from '../../utils/getNotificationConfig'
import { useDesktopNotifications } from '../useDesktopNotifications'
import useNotifications from '../useNotifications'

jest.mock('core/flags', () => ({ useFlag: jest.fn() }))
jest.mock('../../desktopNotify', () => ({
    desktopNotify: jest.fn(),
}))
jest.mock('../../requestNotificationPermission', () => ({
    requestNotificationPermission: jest.fn(),
}))
jest.mock('../../utils/getNotificationConfig', () => jest.fn())
jest.mock('../useNotifications', () => jest.fn())

const getNotificationConfigMock = getNotificationConfig as jest.Mock
const requestNotificationPermissionMock =
    requestNotificationPermission as jest.Mock
const useFlagMock = useFlag as jest.Mock
const useNotificationsMock = useNotifications as jest.Mock

describe('useDesktopNotifications', () => {
    beforeEach(() => {
        useFlagMock.mockReturnValue(true)
        getNotificationConfigMock.mockReturnValue({})
        requestNotificationPermissionMock.mockResolvedValue(true)
    })

    it('should do nothing if the feature flag is disabled', async () => {
        useFlagMock.mockReturnValue(false)

        renderHook(() => useDesktopNotifications())
        const [[cb]] = useNotificationsMock.mock.calls as [
            (notification: Notification) => Promise<void>,
        ][]
        await cb({ type: 'user.mentioned' } as Notification)

        expect(desktopNotify).not.toHaveBeenCalled()
    })

    it('should do nothing if the user has not granted permission to receive notifications', async () => {
        requestNotificationPermissionMock.mockResolvedValue(false)

        renderHook(() => useDesktopNotifications())
        const [[cb]] = useNotificationsMock.mock.calls as [
            (notification: Notification) => Promise<void>,
        ][]
        await cb({ type: 'user.mentioned' } as Notification)

        expect(desktopNotify).not.toHaveBeenCalled()
    })

    it('should do nothing if the notification type does not have a config', async () => {
        getNotificationConfigMock.mockReturnValue(undefined)

        renderHook(() => useDesktopNotifications())
        const [[cb]] = useNotificationsMock.mock.calls as [
            (notification: Notification) => Promise<void>,
        ][]
        await cb({ type: 'user.mentioned' } as Notification)

        expect(desktopNotify).not.toHaveBeenCalled()
    })

    it('should send a notification with a default title if there is no desktop notification config', async () => {
        renderHook(() => useDesktopNotifications())
        const [[cb]] = useNotificationsMock.mock.calls as [
            (notification: Notification) => Promise<void>,
        ][]
        await cb({ id: 'id', type: 'user.mentioned' } as Notification)

        expect(desktopNotify).toHaveBeenCalledWith(
            'id',
            'New notification',
            undefined,
        )
    })

    it('should send a notification with the desktop notification config', async () => {
        const getDesktopNotification = jest.fn(() => ({
            title: 'Desktop notification title',
            description: 'Test description',
        }))
        getNotificationConfigMock.mockReturnValue({ getDesktopNotification })

        renderHook(() => useDesktopNotifications())
        const [[cb]] = useNotificationsMock.mock.calls as [
            (notification: Notification) => Promise<void>,
        ][]
        await cb({ id: 'id', type: 'user.mentioned' } as Notification)

        expect(desktopNotify).toHaveBeenCalledWith(
            'id',
            'Desktop notification title',
            'Test description',
        )
    })
})
