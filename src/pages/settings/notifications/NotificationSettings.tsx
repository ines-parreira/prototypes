import cn from 'classnames'
import React, {FormEvent, useCallback, useMemo} from 'react'

import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import useNotificationSettings from 'pages/settings/notifications/hooks/useNotificationSettings'
import useSoundSetting from 'pages/settings/notifications/hooks/useSoundSetting'
import SoundSetting from 'pages/settings/notifications/SoundSetting'
import css from 'pages/settings/settings.less'

export default function NotificationSettings() {
    const {initialNotificationSound, save} = useNotificationSettings()
    const notificationSound = useSoundSetting(initialNotificationSound)

    const canSave = useMemo(
        () =>
            initialNotificationSound.enabled !== notificationSound.enabled ||
            initialNotificationSound.sound !== notificationSound.sound ||
            initialNotificationSound.volume !== notificationSound.volume,
        [initialNotificationSound, notificationSound]
    )

    const handleSubmit = useCallback(
        (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            if (!canSave) return

            void save({notificationSound})
        },
        [canSave, notificationSound, save]
    )

    return (
        <div className="full-width">
            <PageHeader title="Notifications" />
            <form
                className={cn(css.contentWrapper, css.pageContainer)}
                onSubmit={handleSubmit}
            >
                <SoundSetting
                    {...notificationSound}
                    className={css.mb24}
                    description="Customize your notification sound and volume with our on/off setting, keeping you in control of your audio alerts."
                    title="Message notifications"
                />
                <Button isDisabled={!canSave} intent="primary" type="submit">
                    Save Changes
                </Button>
            </form>
        </div>
    )
}
