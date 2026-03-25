import React, { Fragment } from 'react'

import { useAreFlagsLoading } from '@repo/feature-flags'

import TableBody from 'pages/common/components/table/TableBody'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import type { SoundValue } from 'services/NotificationSounds'

import { categories, notifications } from '../data'
import type { CategoryConfig, Settings } from '../types'
import EventSettingsRow from './EventSettingsRow'
import EventSettingsTableHead from './EventSettingsTableHead'

import css from './EventSettings.less'

type Props = {
    settings: Settings
    onChangeChannel: (
        notificationType: string,
        channel: string,
        value: boolean,
    ) => void
    onChangeSound: (notificationType: string, sound: '' | SoundValue) => void
}

export default function EventSettings({
    settings,
    onChangeChannel,
    onChangeSound,
}: Props) {
    const areFlagsLoading = useAreFlagsLoading()

    if (areFlagsLoading) {
        return null
    }

    const filteredEnabledCategories = categories.filter(
        (category) => category.isEnabled?.() ?? true,
    )

    const filteredEnabledNotifications = (category: CategoryConfig) =>
        (category.notifications || []).filter(
            (notificationType) =>
                notifications[notificationType].isEnabled?.() ?? true,
        )

    return (
        <>
            {filteredEnabledCategories.map((category) => (
                <Fragment key={category.type}>
                    <h2 className={css.heading}>{category.label}</h2>
                    <p className={css.subtitle}>{category.description}</p>

                    <TableWrapper className={css.container}>
                        <EventSettingsTableHead
                            typeHeader={category.typeLabel}
                        />
                        <TableBody>
                            {filteredEnabledNotifications(category).map(
                                (notificationType) => (
                                    <EventSettingsRow
                                        key={notificationType}
                                        config={notifications[notificationType]}
                                        setting={
                                            settings.events[notificationType]
                                        }
                                        onChangeChannel={(channel, value) => {
                                            onChangeChannel(
                                                notificationType,
                                                channel,
                                                value,
                                            )
                                        }}
                                        onChangeSound={(sound) => {
                                            onChangeSound(
                                                notificationType,
                                                sound,
                                            )
                                        }}
                                    />
                                ),
                            )}
                        </TableBody>
                    </TableWrapper>
                </Fragment>
            ))}
        </>
    )
}
