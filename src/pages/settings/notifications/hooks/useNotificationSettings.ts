import {useCallback, useMemo} from 'react'

import {UserSettingType} from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {defaultSound} from 'services/NotificationSounds'
import {submitSetting} from 'state/currentUser/actions'
import {getNotificationSettings} from 'state/currentUser/selectors'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'

import {Setting} from './useSoundSetting'

export default function useNotificationSettings() {
    const dispatch = useAppDispatch()
    const settings = useAppSelector(getNotificationSettings)

    const initialNotificationSound = useMemo(
        () => (settings?.data.notification_sound || defaultSound) as Setting,
        [settings]
    )

    const save = useCallback(
        async ({notificationSound}: {notificationSound: Setting}) => {
            const payload = {
                data: {
                    notification_sound: {
                        enabled: notificationSound.enabled,
                        sound: notificationSound.sound,
                        volume: notificationSound.volume,
                    },
                },
                id: settings?.id,
                type: UserSettingType.NotificationPreferences,
            }

            // for some reason, `submitSetting` accepts a `UserSetting`,
            // but while it checks for `UserSetting.id` to be null, this
            // is not actually supported in the type. I'm just going to
            // ignore this type error for now cause that action is being
            // used in more places
            // @ts-expect-error
            await dispatch(submitSetting(payload, true))

            logEvent(SegmentEvent.NotificationSettingsUpdated, payload)
        },
        [dispatch, settings]
    )

    return {
        initialNotificationSound,
        save,
    }
}
