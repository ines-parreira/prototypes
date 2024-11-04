import React from 'react'

import TableBody from 'pages/common/components/table/TableBody'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import {SoundValue} from 'services/NotificationSounds'

import {events, legacyEvent, ticketMessageCreatedEvents} from '../data'
import {LegacyNotificationType, NotificationType, Settings} from '../types'

import css from './EventSettings.less'
import EventSettingsRow from './EventSettingsRow'
import EventSettingsTableHead from './EventSettingsTableHead'

type Props = {
    settings: Settings
    onChangeChannel: (
        notificationType: NotificationType,
        channel: string,
        value: boolean
    ) => void
    onChangeSound: (
        notificationType: NotificationType | LegacyNotificationType,
        sound: '' | SoundValue
    ) => void
}

const availableEvents = [legacyEvent, ...events]

export default function EventSettings({
    settings,
    onChangeChannel,
    onChangeSound,
}: Props) {
    return (
        <>
            <h2 className={css.heading}>Ticket updates</h2>
            <p className={css.subtitle}>
                Get notified when one of these events happen:
            </p>

            <TableWrapper className={css.container}>
                <EventSettingsTableHead typeHeader="Event" />
                <TableBody>
                    {availableEvents.map((event) => (
                        <EventSettingsRow
                            key={event.type}
                            config={event}
                            setting={settings.events[event.type]}
                            onChangeChannel={(channel, value) => {
                                event.type !== 'legacy-chat-and-messaging' &&
                                    onChangeChannel(event.type, channel, value)
                            }}
                            onChangeSound={(sound) => {
                                onChangeSound(event.type, sound)
                            }}
                        />
                    ))}
                </TableBody>
            </TableWrapper>

            <h2 className={css.heading}>New messages</h2>
            <p className={css.subtitle}>
                Get notified when you receive new messages from these channels.
            </p>
            <TableWrapper className={css.container}>
                <EventSettingsTableHead typeHeader="Message channel" />
                <TableBody>
                    {ticketMessageCreatedEvents.map((event) => (
                        <EventSettingsRow
                            key={event.type}
                            config={event}
                            setting={settings.events[event.type]}
                            onChangeChannel={(channel, value) => {
                                onChangeChannel(event.type, channel, value)
                            }}
                            onChangeSound={(sound) => {
                                onChangeSound(event.type, sound)
                            }}
                        />
                    ))}
                </TableBody>
            </TableWrapper>
        </>
    )
}
