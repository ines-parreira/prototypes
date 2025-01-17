import {useKnockClient} from '@knocklabs/react'
import {useCallback, useMemo, useState} from 'react'

import {AI_AGENT_SET_AND_OPTIMIZED_TYPE} from 'automate/notifications/constants'
import {logEvent, SegmentEvent} from 'common/segment'
import {UserSettingType} from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useAsyncFn from 'hooks/useAsyncFn'
import useEffectOnce from 'hooks/useEffectOnce'
import {defaultSound, SoundValue} from 'services/NotificationSounds'
import {submitSetting} from 'state/currentUser/actions'
import {getNotificationSettings} from 'state/currentUser/selectors'

import {categories, channels, notifications} from '../data'
import type {NotificationConfig, Settings} from '../types'

export default function useSettings() {
    const dispatch = useAppDispatch()
    const knockClient = useKnockClient()
    const allSettings = useAppSelector(getNotificationSettings)

    const notificationsWithSettings = useMemo(
        () =>
            categories
                .reduce(
                    (acc, c) => [...acc, ...(c.notifications || [])],
                    [] as string[]
                )
                .map((n) => notifications[n]),
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

        const notificationSound =
            allSettings?.data.notification_sound || defaultSound

        const setting = {
            volume: notificationSound.volume,
            events: notificationsWithSettings.reduce(
                (eventsAcc, config) => {
                    const eventSettings = allSettings?.data.events?.[
                        config.type
                    ] || {sound: defaultSound.sound}

                    const workflowPreferences =
                        config.type !== 'legacy-chat-and-messaging'
                            ? preferences.workflows?.[
                                  notifications[config.type].workflow
                              ]
                            : undefined

                    return {
                        ...eventsAcc,
                        [config.type]: {
                            sound:
                                config.type === 'legacy-chat-and-messaging'
                                    ? notificationSound.enabled
                                        ? notificationSound.sound
                                        : ''
                                    : eventSettings.sound,
                            channels: channels.reduce(
                                (channelsAcc, channel) => ({
                                    ...channelsAcc,
                                    [channel.type]:
                                        config.type ===
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
                                eventsAcc[config.type]?.channels || {}
                            ),
                        },
                    }
                },
                {} as Settings['events']
            ),
        }

        setSettings(setting)
    }, [allSettings, getKnockPreferences, notificationsWithSettings])

    useEffectOnce(() => {
        void initializeSettings()
    })

    const handleChangeChannel = useCallback(
        (notificationType: string, channel: string, enabled: boolean) => {
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
        (notificationType: string, sound: '' | SoundValue) => {
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
                events: notificationsWithSettings
                    .filter(
                        (config): config is NotificationConfig =>
                            config.type !== 'legacy-chat-and-messaging'
                    )
                    .reduce(
                        (acc, config) => ({
                            ...acc,
                            [config.type]: {
                                sound: settings.events[config.type].sound,
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
        } = notificationsWithSettings
            .filter(
                (config): config is NotificationConfig =>
                    config.type !== 'legacy-chat-and-messaging'
            )
            .reduce(
                (eventsAcc, config) => ({
                    ...eventsAcc,
                    [notifications[config.type].workflow]: {
                        channel_types: channels.reduce(
                            (channelsAcc, channel) => ({
                                ...channelsAcc,
                                [channel.type]:
                                    settings.events[config.type].channels[
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

        if (
            settings.events[AI_AGENT_SET_AND_OPTIMIZED_TYPE]?.channels
                .in_app_feed === false
        ) {
            logEvent(SegmentEvent.AiAgentOnboardingNotificationDisabled)
        }
    }, [
        allSettings,
        dispatch,
        knockClient,
        notificationsWithSettings,
        settings,
    ])

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
