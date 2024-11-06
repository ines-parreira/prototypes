import React, {Fragment} from 'react'

import TableBody from 'pages/common/components/table/TableBody'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import {SoundValue} from 'services/NotificationSounds'

import {categories, notifications} from '../data'
import {Settings} from '../types'

import css from './EventSettings.less'
import EventSettingsRow from './EventSettingsRow'
import EventSettingsTableHead from './EventSettingsTableHead'

type Props = {
    settings: Settings
    onChangeChannel: (
        notificationType: string,
        channel: string,
        value: boolean
    ) => void
    onChangeSound: (notificationType: string, sound: '' | SoundValue) => void
}

export default function EventSettings({
    settings,
    onChangeChannel,
    onChangeSound,
}: Props) {
    return (
        <>
            {categories.map((category) => (
                <Fragment key={category.type}>
                    <h2 className={css.heading}>{category.label}</h2>
                    <p className={css.subtitle}>{category.description}</p>

                    <TableWrapper className={css.container}>
                        <EventSettingsTableHead
                            typeHeader={category.typeLabel}
                        />
                        <TableBody>
                            {(category.notifications || []).map(
                                (notificationType) => (
                                    <EventSettingsRow
                                        key={notificationType}
                                        config={notifications[notificationType]}
                                        setting={
                                            settings.events[notificationType]
                                        }
                                        onChangeChannel={(channel, value) => {
                                            notificationType !==
                                                'legacy-chat-and-messaging' &&
                                                onChangeChannel(
                                                    notificationType,
                                                    channel,
                                                    value
                                                )
                                        }}
                                        onChangeSound={(sound) => {
                                            onChangeSound(
                                                notificationType,
                                                sound
                                            )
                                        }}
                                    />
                                )
                            )}
                        </TableBody>
                    </TableWrapper>
                </Fragment>
            ))}
        </>
    )
}
