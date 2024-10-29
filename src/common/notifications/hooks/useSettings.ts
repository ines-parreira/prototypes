import {useKnockClient} from '@knocklabs/react'
import {useCallback, useMemo, useState} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {UserSettingType} from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useAsyncFn from 'hooks/useAsyncFn'
import useEffectOnce from 'hooks/useEffectOnce'
import {defaultSound, SoundValue} from 'services/NotificationSounds'
import {submitSetting} from 'state/currentUser/actions'
import {getNotificationSettings} from 'state/currentUser/selectors'

import {
    channels,
    events,
    legacyEvent,
    ticketMessageCreatedEvents,
    workflowMap,
} from '../data'
import {
    LegacyNotificationType,
    NotificationType,
    Settings,
    Event,
} from '../types'

const baseEvents = [legacyEvent, ...events]

export default function useSettings() {
    const dispatch = useAppDispatch()
    const knockClient = useKnockClient()
    const allSettings = useAppSelector(getNotificationSettings)

    const allEvents = useMemo(
        () => [...baseEvents, ...ticketMessageCreatedEvents],
        []
    )

    const [{loading: isFetchingKnockPreferences}, getKnockPreferences] =
        useAsyncFn(async () => {
            await knockClient.user.identify()
            return await knockClient.preferences.get()
        })

    const [settings, setSettings] = useState<Settings>({
        volume: defaultSound.volume,
        events: {},
    })

    const initializeSettings = useCallback(async () => {
        const preferences = await getKnockPreferences()

        const allEvents = [...baseEvents, ...ticketMessageCreatedEvents]

        const notificationSound =
            allSettings?.data.notification_sound || defaultSound

        const setting = {
            volume: notificationSound.volume,
            events: allEvents.reduce(
                (eventsAcc, event) => {
                    const eventSettings = allSettings?.data.events?.[
                        event.type
                    ] || {sound: defaultSound.sound}

                    const workflowPreferences =
                        event.type !== 'legacy-chat-and-messaging'
                            ? preferences.workflows?.[workflowMap[event.type]]
                            : undefined

                    return {
                        ...eventsAcc,
                        [event.type]: {
                            sound:
                                event.type === 'legacy-chat-and-messaging'
                                    ? notificationSound.enabled
                                        ? notificationSound.sound
                                        : ''
                                    : eventSettings.sound,
                            channels: channels.reduce(
                                (channelsAcc, channel) => ({
                                    ...channelsAcc,
                                    [channel.type]:
                                        event.type ===
                                        'legacy-chat-and-messaging'
                                            ? true
                                            : !workflowPreferences ||
                                                typeof workflowPreferences ===
                                                    'boolean'
                                              ? true
                                              : workflowPreferences
                                                    .channel_types[
                                                    channel.type
                                                ],
                                }),
                                eventsAcc[event.type]?.channels || {}
                            ),
                        },
                    }
                },
                {} as Settings['events']
            ),
        }

        setSettings(setting)
    }, [getKnockPreferences, allSettings])

    useEffectOnce(() => {
        void initializeSettings()
    })

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
        (
            notificationType: NotificationType | LegacyNotificationType,
            sound: '' | SoundValue
        ) => {
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
        const chatAndMessaging = settings.events['legacy-chat-and-messaging']
        const payload = {
            data: {
                notification_sound: {
                    enabled: chatAndMessaging.sound !== '',
                    sound:
                        chatAndMessaging.sound !== ''
                            ? chatAndMessaging.sound
                            : defaultSound.sound,
                    volume: settings.volume,
                },
                events: allEvents
                    .filter(
                        (event): event is Event =>
                            event.type !== 'legacy-chat-and-messaging'
                    )
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
        } = allEvents
            .filter(
                (event): event is Event =>
                    event.type !== 'legacy-chat-and-messaging'
            )
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
    }, [allEvents, allSettings, dispatch, knockClient, settings])

    return useMemo(
        () => ({
            save,
            settings,
            onChangeChannel: handleChangeChannel,
            onChangeSound: handleChangeSound,
            onChangeVolume: handleChangeVolume,
            isLoading: isFetchingKnockPreferences,
        }),
        [
            save,
            settings,
            handleChangeChannel,
            handleChangeSound,
            handleChangeVolume,
            isFetchingKnockPreferences,
        ]
    )
}
