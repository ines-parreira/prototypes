import { act, renderHook } from '@testing-library/react-hooks'

import { notificationSounds } from 'services'
import { defaultSound } from 'services/NotificationSounds'
import { getNotificationSettings } from 'state/currentUser/selectors'

import type { Notification } from '../../types'
import getNotificationConfig from '../../utils/getNotificationConfig'
import useNotifications from '../useNotifications'
import useToasts from '../useToasts'

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())

jest.mock('services', () => ({
    notificationSounds: {
        play: jest.fn(),
    },
}))

jest.mock('state/currentUser/selectors', () => ({
    getNotificationSettings: jest.fn(),
}))
const getNotificationSettingsMock =
    getNotificationSettings as unknown as jest.Mock

jest.mock('../../utils/getNotificationConfig', () => jest.fn())
const getNotificationConfigMock = getNotificationConfig as jest.Mock

jest.mock('../useNotifications', () => jest.fn())
const useNotificationsMock = useNotifications as jest.Mock

describe('useToasts', () => {
    let play: jest.Mock

    beforeEach(() => {
        getNotificationConfigMock.mockReturnValue({
            workflow: 'ticket-message.created',
        })
        getNotificationSettingsMock.mockReturnValue({
            data: {
                events: {},
                notification_sound: {
                    volume: 5,
                },
            },
        })
        play = jest.fn()
        notificationSounds.play = play
        useNotificationsMock.mockReset()
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should return no notifications by default', () => {
        const { result } = renderHook(() => useToasts())

        expect(result.current).toEqual({
            dismiss: expect.any(Function),
            notifications: [],
        })
    })

    it('should return notifications when they come in', () => {
        const { result } = renderHook(() => useToasts())

        const [[listener]] = useNotificationsMock.mock.calls as [
            (n: Notification) => void,
        ][]

        act(() => {
            listener({ id: '1' } as unknown as Notification)
        })
        expect(result.current).toEqual({
            dismiss: expect.any(Function),
            notifications: [{ id: '1' }],
        })
    })

    it('should automatically dismiss notifications after 5 seconds', () => {
        const { result } = renderHook(() => useToasts())

        const [[listener]] = useNotificationsMock.mock.calls as [
            (n: Notification) => void,
        ][]

        act(() => {
            listener({ id: '1' } as unknown as Notification)
        })
        jest.advanceTimersByTime(4999)
        expect(result.current).toEqual({
            dismiss: expect.any(Function),
            notifications: [{ id: '1' }],
        })

        act(() => {
            jest.advanceTimersByTime(1)
        })
        expect(result.current).toEqual({
            dismiss: expect.any(Function),
            notifications: [],
        })
    })

    it('should manually dismiss a notification', () => {
        const { result } = renderHook(() => useToasts())

        const [[listener]] = useNotificationsMock.mock.calls as [
            (n: Notification) => void,
        ][]

        act(() => {
            listener({ id: '1' } as unknown as Notification)
        })
        act(() => {
            result.current.dismiss('1')
        })
        expect(result.current).toEqual({
            dismiss: expect.any(Function),
            notifications: [],
        })
    })

    it('should play a default sound if no settings are found for the notification', () => {
        renderHook(() => useToasts())

        const [[listener]] = useNotificationsMock.mock.calls as [
            (n: Notification) => void,
        ][]

        act(() => {
            listener({ id: '1' } as unknown as Notification)
        })

        expect(play).toHaveBeenCalledWith(defaultSound.sound, 5)
    })

    it('should play an event-specific sound for the notification', () => {
        getNotificationConfigMock.mockReturnValue({
            workflow: 'user.mentioned',
        })

        getNotificationSettingsMock.mockReturnValue({
            data: {
                events: {
                    'user.mentioned': {
                        sound: 'definite',
                    },
                },
                notification_sound: {
                    volume: 5,
                },
            },
        })

        renderHook(() => useToasts())

        const [[listener]] = useNotificationsMock.mock.calls as [
            (n: Notification) => void,
        ][]

        act(() => {
            listener({ id: '1' } as unknown as Notification)
        })

        expect(play).toHaveBeenCalledWith('definite', 5)
    })

    it('should play no sound for the notification if that was configured', () => {
        getNotificationConfigMock.mockReturnValue({
            workflow: 'user.mentioned',
        })

        getNotificationSettingsMock.mockReturnValue({
            data: {
                events: {
                    'user.mentioned': {
                        sound: '',
                    },
                },
                notification_sound: {
                    volume: 5,
                },
            },
        })

        renderHook(() => useToasts())

        const [[listener]] = useNotificationsMock.mock.calls as [
            (n: Notification) => void,
        ][]

        act(() => {
            listener({ id: '1' } as unknown as Notification)
        })

        expect(play).not.toHaveBeenCalled()
    })
})
