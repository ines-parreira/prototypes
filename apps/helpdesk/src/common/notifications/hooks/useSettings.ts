import { useCallback, useMemo, useState } from 'react'

import { PreferenceSet } from '@knocklabs/client'
import { useKnockClient } from '@knocklabs/react'
import { useAsyncFn, useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import _merge from 'lodash/merge'

import { AI_AGENT_SET_AND_OPTIMIZED_TYPE } from 'automate/notifications/constants'
import { UserSettingType } from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { defaultSound, SoundValue } from 'services/NotificationSounds'
import { submitSetting } from 'state/currentUser/actions'
import { getNotificationSettings } from 'state/currentUser/selectors'

import { categories, channels, notifications } from '../data'
import type { Settings } from '../types'

export default function useSettings() {
    const dispatch = useAppDispatch()
    const knockClient = useKnockClient()
    const allSettings = useAppSelector(getNotificationSettings)
    const [knockPreferences, setKnockPreferences] = useState<PreferenceSet>()

    const notificationsWithSettings = useMemo(
        () =>
            categories
                .reduce(
                    (acc, c) => [...acc, ...(c.notifications || [])],
                    [] as string[],
                )
                .map((n) => notifications[n]),
        [],
    )

    const [{ loading: isFetchingKnockPreferences }, getKnockPreferences] =
        useAsyncFn(async () => {
            await knockClient.user.identify()
            return await knockClient.user.getPreferences()
        })

    const [settings, setSettings] = useState<Settings>({
        volume: defaultSound.volume,
        events: {},
    })

    const initializeSettings = useCallback(async () => {
        const preferences = await getKnockPreferences()
        setKnockPreferences(preferences)

        const notificationSound =
            allSettings?.data.notification_sound || defaultSound

        const setting = {
            volume: notificationSound.volume,
            events: notificationsWithSettings.reduce(
                (eventsAcc, config) => {
                    const eventSettings = allSettings?.data.events?.[
                        config.type
                    ] || { sound: defaultSound.sound }

                    const workflowPreferences =
                        preferences.workflows?.[
                            notifications[config.type].workflow
                        ]

                    return {
                        ...eventsAcc,
                        [config.type]: {
                            sound: eventSettings.sound,
                            channels: channels.reduce(
                                (channelsAcc, channel) => ({
                                    ...channelsAcc,
                                    [channel.type]:
                                        !workflowPreferences ||
                                        typeof workflowPreferences === 'boolean'
                                            ? true
                                            : 'conditions' in
                                                workflowPreferences
                                              ? true
                                              : workflowPreferences
                                                    .channel_types[
                                                    channel.type
                                                ],
                                }),
                                eventsAcc[config.type]?.channels || {},
                            ),
                        },
                    }
                },
                {} as Settings['events'],
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
        [],
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
        [],
    )

    const handleChangeVolume = useCallback((volume: number) => {
        setSettings((s) => ({ ...s, volume }))
    }, [])

    const save = useCallback(async () => {
        const payload = {
            data: {
                notification_sound: {
                    enabled: false,
                    sound: defaultSound.sound,
                    volume: settings.volume,
                },
                events: notificationsWithSettings.reduce(
                    (acc, config) => ({
                        ...acc,
                        [config.type]: {
                            sound: settings.events[config.type].sound,
                        },
                    }),
                    {},
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
        } = notificationsWithSettings.reduce(
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
                        {},
                    ),
                },
            }),
            {},
        )

        // we need to preserve existing workflow channels - e.g "push"
        const preferenceWorkflows = knockPreferences?.workflows || {}
        const mergedWorkflows = _merge(preferenceWorkflows, workflows)

        await Promise.all([
            knockClient.user.setPreferences({
                categories: {},
                channel_types: {},
                workflows: mergedWorkflows,
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
        knockPreferences?.workflows,
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
        ],
    )
}
