import cn from 'classnames'
import React, {FormEvent, useCallback} from 'react'

import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import useNotificationSettings from 'pages/settings/notifications/hooks/useNotificationSettings'
import useSoundSetting from 'pages/settings/notifications/hooks/useSoundSetting'
import SoundSetting from 'pages/settings/notifications/SoundSetting'
import settingsCss from 'pages/settings/settings.less'

import css from './NotificationSettings.less'

export default function NotificationSettings() {
    const {initialNotificationSound, save} = useNotificationSettings()
    const notificationSound = useSoundSetting(initialNotificationSound)

    const handleSubmit = useCallback(
        (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            void save({notificationSound})
        },
        [notificationSound, save]
    )

    return (
        <div className="full-width">
            <PageHeader title="Notifications" />
            <form
                className={cn(
                    settingsCss.contentWrapper,
                    settingsCss.pageContainer
                )}
                onSubmit={handleSubmit}
            >
                <SoundSetting
                    {...notificationSound}
                    className={settingsCss.mb24}
                    description="Customize your notification sound and volume with our on/off setting, keeping you in control of your audio alerts."
                    title="Message notifications"
                />
                <Button intent="primary" type="submit">
                    Save settings
                </Button>

                <p className={css.credits}>
                    <i className={cn('material-icons-outlined', css.infoIcon)}>
                        info
                    </i>
                    Notification sounds in Gorgias are sourced from{' '}
                    <a href="https://notificationsounds.com/" rel="noreferrer">
                        notificationsounds.com
                    </a>
                </p>
            </form>
        </div>
    )
}
