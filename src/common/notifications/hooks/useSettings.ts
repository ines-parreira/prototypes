import {useKnockClient} from '@knocklabs/react'
import {useCallback, useEffect, useMemo, useState} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {UserSettingType} from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {defaultSound, SoundValue} from 'services/NotificationSounds'
import {submitSetting} from 'state/currentUser/actions'
import {getNotificationSettings} from 'state/currentUser/selectors'

import {channels, events, workflowMap} from '../data'
import {NotificationType, Settings} from '../types'

export default function useSettings() {
    const dispatch = useAppDispatch()
    const knockClient = useKnockClient()
    const allSettings = useAppSelector(getNotificationSettings)

    const [settings, setSettings] = useState<Settings>(() => {
        const notificationSound =
            allSettings?.data.notification_sound || defaultSound

        return {
            volume: notificationSound.volume,
            events: events.reduce((acc, event) => {
                const eventSettings = allSettings?.data.events?.[
                    event.type
                ] || {sound: defaultSound.sound}
                return {
                    ...acc,
                    [event.type]: {
                        sound:
                            event.type === 'ticket-message.created'
                                ? notificationSound.enabled
                                    ? notificationSound.sound
                                    : ''
                                : eventSettings.sound,
                    },
                }
            }, {}),
        }
    })

    useEffect(() => {
        void (async () => {
            await knockClient.user.identify()
            const preferences = await knockClient.preferences.get()
            setSettings((s) => ({
                ...s,
                events: events.reduce((eventsAcc, event) => {
                    const workflowPreferences =
                        preferences.workflows?.[workflowMap[event.type]]
                    return {
                        ...eventsAcc,
                        [event.type]: {
                            ...eventsAcc[event.type],
                            channels: channels.reduce(
                                (channelsAcc, channel) => ({
                                    ...channelsAcc,
                                    [channel.type]:
                                        event.type === 'ticket-message.created'
                                            ? true
                                            : !workflowPreferences ||
                                              typeof workflowPreferences ===
                                                  'boolean'
                                            ? true
                                            : workflowPreferences.channel_types[
                                                  channel.type
                                              ],
                                }),
                                eventsAcc[event.type].channels || {}
                            ),
                        },
                    }
                }, s.events),
            }))
        })()
    }, [knockClient])

    const handleChangeChannel = useCallback(
        (
            notificationType: NotificationType,
            channel: string,
            enabled: boolean
        ) => {
            setSettings((s) => ({
                ...s,
                events: {
                    ...s.events,
                    [notificationType]: {
                        ...s.events[notificationType],
                        channels: {
                            ...s.events[notificationType].channels,
                            [channel]: enabled,
                        },
                    },
                },
            }))
        },
        []
    )

    const handleChangeSound = useCallback(
        (notificationType: NotificationType, sound: '' | SoundValue) => {
            setSettings((s) => {
                return {
                    ...s,
                    events: {
                        ...s.events,
                        [notificationType]: {
                            ...s.events?.[notificationType],
                            sound,
                        },
                    },
                }
            })
        },
        []
    )

    const handleChangeVolume = useCallback((volume: number) => {
        setSettings((s) => ({...s, volume}))
    }, [])

    const save = useCallback(async () => {
        const messageReceived = settings.events['ticket-message.created']
        const payload = {
            data: {
                notification_sound: {
                    enabled: messageReceived.sound !== '',
                    sound:
                        messageReceived.sound !== ''
                            ? messageReceived.sound
                            : defaultSound.sound,
                    volume: settings.volume,
                },
                events: events
                    .filter((event) => event.type !== 'ticket-message.created')
                    .reduce(
                        (acc, event) => ({
                            ...acc,
                            [event.type]: {
                                sound: settings.events[event.type].sound,
                            },
                        }),
                        {}
                    ),
            },
            id: allSettings?.id,
            type: UserSettingType.NotificationPreferences,
        }

        const workflows: {
            [k: string]: {
                channel_types: {
                    [k: string]: boolean
                }
            }
        } = events
            .filter((event) => event.type !== 'ticket-message.created')
            .reduce(
                (eventsAcc, event) => ({
                    ...eventsAcc,
                    [workflowMap[event.type]]: {
                        channel_types: channels.reduce(
                            (channelsAcc, channel) => ({
                                ...channelsAcc,
                                [channel.type]:
                                    settings.events[event.type].channels[
                                        channel.type
                                    ],
                            }),
                            {}
                        ),
                    },
                }),
                {}
            )

        await Promise.all([
            knockClient.preferences.set({
                categories: {},
                channel_types: {},
                workflows,
            }),

            // for some reason, `submitSetting` accepts a `UserSetting`,
            // but while it checks for `UserSetting.id` to be null, this
            // is not actually supported in the type. I'm just going to
            // ignore this type error for now cause that action is being
            // used in more places
            // @ts-expect-error
            dispatch(submitSetting(payload, true)),
        ])

        logEvent(SegmentEvent.NotificationSettingsUpdated, settings)
    }, [allSettings, dispatch, knockClient, settings])

    return useMemo(
        () => ({
            save,
            settings,
            onChangeChannel: handleChangeChannel,
            onChangeSound: handleChangeSound,
            onChangeVolume: handleChangeVolume,
        }),
        [
            save,
            settings,
            handleChangeChannel,
            handleChangeSound,
            handleChangeVolume,
        ]
    )
}
