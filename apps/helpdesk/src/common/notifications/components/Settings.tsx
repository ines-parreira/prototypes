import type { ChangeEvent, FormEvent } from 'react'
import React, { useCallback, useEffect, useRef } from 'react'

import { useMouseRelease } from '@repo/hooks'
import cn from 'classnames'

import { LegacyButton as Button, LoadingSpinner } from '@gorgias/axiom'

import PageHeader from 'pages/common/components/PageHeader'
import settingsCss from 'pages/settings/settings.less'
import { notificationSounds } from 'services'
import type { SoundValue } from 'services/NotificationSounds'
import { defaultSound } from 'services/NotificationSounds'

import useSettings from '../hooks/useSettings'
import EventSettings from './EventSettings'
import VolumeControl from './VolumeControl'

import css from './Settings.less'

export default function Settings() {
    const {
        save,
        settings,
        onChangeChannel,
        onChangeSound,
        onChangeVolume,
        isLoading,
    } = useSettings()

    const volumeRef = useRef(settings.volume)
    useEffect(() => {
        volumeRef.current = settings.volume
    }, [settings.volume])

    const handleMouseUp = useCallback(() => {
        notificationSounds.play(defaultSound.sound, volumeRef.current)
    }, [])

    const onMouseDown = useMouseRelease(handleMouseUp)

    const handleChangeSound = useCallback(
        (notificationType: string, sound: '' | SoundValue) => {
            onChangeSound(notificationType, sound)
            if (sound !== '') {
                notificationSounds.play(sound, settings.volume)
            }
        },
        [settings.volume, onChangeSound],
    )

    const handleChangeVolume = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const volume = parseInt(e.target.value, 10)
            onChangeVolume(volume)
        },
        [onChangeVolume],
    )

    const handleSubmit = useCallback(
        (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            void save()
        },
        [save],
    )

    return (
        <div className="full-width">
            <PageHeader title="Notifications" />
            {isLoading ? (
                <div className={css.spinner}>
                    <LoadingSpinner size="big" />
                </div>
            ) : (
                <form
                    className={cn(
                        settingsCss.contentWrapper,
                        settingsCss.pageContainer,
                        css.container,
                    )}
                    onSubmit={handleSubmit}
                >
                    <h2 className={css.heading}>Volume control</h2>
                    <p className={css.subtitle}>
                        This control changes the volume for all active
                        notifications.
                    </p>

                    <VolumeControl
                        value={settings.volume}
                        onChange={handleChangeVolume}
                        onMouseDown={onMouseDown}
                    />

                    <EventSettings
                        settings={settings}
                        onChangeChannel={onChangeChannel}
                        onChangeSound={handleChangeSound}
                    />

                    <Button intent="primary" type="submit">
                        Save Changes
                    </Button>
                </form>
            )}
        </div>
    )
}
