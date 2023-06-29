import {useCallback} from 'react'

import {Setting} from './useSoundSetting'

export default function useNotificationSettings() {
    const save = useCallback(
        ({notificationSound}: {notificationSound: Setting}) => {
            // eslint-disable-next-line no-console
            console.info('SAVE', {
                type: 'notifications-preferences',
                data: {
                    notification_sound: {
                        enabled: notificationSound.enabled,
                        sound: notificationSound.sound,
                        volume: notificationSound.volume,
                    },
                },
            })
        },
        []
    )

    return {save}
}
