import {useKnockClient} from '@knocklabs/react'
import {useCallback, useMemo, useState} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {UserSettingType} from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {defaultSound, SoundValue} from 'services/NotificationSounds'
import {submitSetting} from 'state/currentUser/actions'
import {getNotificationSettings} from 'state/currentUser/selectors'
import {FeatureFlagKey} from 'config/featureFlags'
import {useFlag} from 'common/flags'
import useAsyncFn from 'hooks/useAsyncFn'
import {getLDClient} from 'utils/launchDarkly'
import useEffectOnce from 'hooks/useEffectOnce'

import {
    channels,
    events,
    ticketMessageCreatedEvents,
    workflowMap,
} from '../data'
import {NotificationType, Settings} from '../types'

const client = getLDClient()

export default function useSettings() {
    const dispatch = useAppDispatch()
    const knockClient = useKnockClient()
    const allSettings = useAppSelector(getNotificationSettings)

    const [{loading: isInitializingLD}, initializeLD] = useAsyncFn(async () => {
        try {
            await client.waitForInitialization(3)
        } catch (e) {}
    })

    const isTicketMessageCreatedEnabled = useFlag(
        FeatureFlagKey.NotificationsTicketMessageCreated,
        false
    )

    const allEvents = useMemo(
        () =>
            isTicketMessageCreatedEnabled
                ? [
                      ...events.filter(
                          (event) => event.type !== 'ticket-message.created'
                      ),
                      ...ticketMessageCreatedEvents,
                  ]
                : events,
        [isTicketMessageCreatedEnabled]
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
        await initializeLD()
        const preferences = await getKnockPreferences()

        const isTicketMessageCreatedEnabled = !!client.variation(
            FeatureFlagKey.NotificationsTicketMessageCreated,
            false
        )

        const allEvents = isTicketMessageCreatedEnabled
            ? [
                  ...events.filter(
                      (event) => event.type !== 'ticket-message.created'
                  ),
                  ...ticketMessageCreatedEvents,
              ]
            : events

        const notificationSound =
            allSettings?.data.notification_sound || defaultSound

        const setting = {
            volume: notificationSound.volume,
            events: allEvents.reduce((eventsAcc, event) => {
                const eventSettings = allSettings?.data.events?.[
                    event.type
                ] || {sound: defaultSound.sound}

                const workflowPreferences =
                    preferences.workflows?.[workflowMap[event.type]]

                return {
                    ...eventsAcc,
                    [event.type]: {
                        sound:
                            event.type === 'ticket-message.created'
                                ? (isTicketMessageCreatedEnabled &&
                                      allSettings?.data.events?.[event.type]
                                          ?.sound) ||
                                  notificationSound.enabled
                                    ? notificationSound.sound
                                    : ''
                                : eventSettings.sound,
                        channels: channels.reduce(
                            (channelsAcc, channel) => ({
                                ...channelsAcc,
                                [channel.type]:
                                    event.type === 'ticket-message.created' &&
                                    !isTicketMessageCreatedEnabled
                                        ? true
                                        : !workflowPreferences ||
                                          typeof workflowPreferences ===
                                              'boolean'
                                        ? true
                                        : workflowPreferences.channel_types[
                                              channel.type
                                          ],
                            }),
                            eventsAcc[event.type]?.channels || {}
                        ),
                    },
                }
            }, {} as Settings['events']),
        }

        setSettings(setting)
    }, [initializeLD, getKnockPreferences, allSettings])

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
        const ticketMessageCreated = settings.events['ticket-message.created']
        const payload = {
            data: {
                notification_sound: {
                    enabled: ticketMessageCreated.sound !== '',
                    sound:
                        ticketMessageCreated.sound !== ''
                            ? ticketMessageCreated.sound
                            : defaultSound.sound,
                    volume: settings.volume,
                },
                events: allEvents
                    .filter((event) =>
                        !isTicketMessageCreatedEnabled
                            ? !event.type.includes('ticket-message.created')
                            : true
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
            .filter((event) =>
                !isTicketMessageCreatedEnabled
                    ? !event.type.includes('ticket-message.created')
                    : true
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
    }, [
        allEvents,
        allSettings,
        dispatch,
        knockClient,
        settings,
        isTicketMessageCreatedEnabled,
    ])

    return useMemo(
        () => ({
            save,
            settings,
            onChangeChannel: handleChangeChannel,
            onChangeSound: handleChangeSound,
            onChangeVolume: handleChangeVolume,
            isLoading: isInitializingLD || isFetchingKnockPreferences,
        }),
        [
            save,
            settings,
            handleChangeChannel,
            handleChangeSound,
            handleChangeVolume,
            isInitializingLD,
            isFetchingKnockPreferences,
        ]
    )
}
