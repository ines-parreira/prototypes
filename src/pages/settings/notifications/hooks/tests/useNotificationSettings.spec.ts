import {renderHook} from '@testing-library/react-hooks'

import {UserSettingType} from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {defaultSound} from 'services/NotificationSounds'
import {submitSetting} from 'state/currentUser/actions'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'

import useNotificationSettings from '../useNotificationSettings'

jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('services/NotificationSounds', () => ({
    defaultSound: {
        enabled: true,
        sound: 'default',
        volume: 5,
    },
}))
jest.mock('state/currentUser/actions', () => ({
    submitSetting: jest.fn(() => 'submit-setting'),
}))
jest.mock('store/middlewares/segmentTracker', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        NotificationSettingsUpdated: 'notification-settings-updated',
    },
}))

const logEventMock = logEvent as jest.Mock
const submitSettingMock = submitSetting as jest.Mock
const useAppDispatchMock = useAppDispatch as jest.Mock
const useAppSelectorMock = useAppSelector as jest.Mock

describe('useNotificationSettings', () => {
    let dispatch: jest.Mock

    beforeEach(() => {
        dispatch = jest.fn()

        useAppDispatchMock.mockReturnValue(dispatch)
        useAppSelectorMock.mockReturnValue({
            data: defaultSound,
            id: 1,
            type: UserSettingType.NotificationPreferences,
        })
    })

    it('should return default state', () => {
        const {result} = renderHook(() => useNotificationSettings())

        expect(result.current).toEqual({
            initialNotificationSound: {
                enabled: true,
                sound: 'default',
                volume: 5,
            },
            save: expect.any(Function),
        })
    })

    it('should dispatch an action and log an event when saving', async () => {
        const {result} = renderHook(() => useNotificationSettings())

        await result.current.save({
            notificationSound: {
                enabled: true,
                sound: 'intuition',
                volume: 7,
            },
        })

        const payload = {
            data: {
                notification_sound: {
                    enabled: true,
                    sound: 'intuition',
                    volume: 7,
                },
            },
            id: 1,
            type: UserSettingType.NotificationPreferences,
        }

        expect(submitSettingMock).toHaveBeenCalledWith(payload, true)

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.NotificationSettingsUpdated,
            payload
        )
    })
})
