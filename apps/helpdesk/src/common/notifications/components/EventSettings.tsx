import React, { Fragment, useMemo } from 'react'

import { useAreFlagsLoading } from '@repo/feature-flags'

import { useAutomateNotificationSettingsVisibility } from 'automate/notifications/hooks/useAutomateNotificationSettingsVisibility'
import { DefaultExportTableBody as TableBody } from 'pages/common/components/table/TableBody'
import { TableWrapper } from 'pages/common/components/table/TableWrapper'
import type { SoundValue } from 'services/NotificationSounds'

import { categories, notifications } from '../data'
import type { CategoryConfig, Settings } from '../types'
import { EventSettingsRow } from './EventSettingsRow'
import { EventSettingsTableHead } from './EventSettingsTableHead'

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

type ResolvedCategory = {
    category: CategoryConfig
    notificationTypes: string[]
}

export function EventSettings({
    settings,
    onChangeChannel,
    onChangeSound,
}: Props) {
    const areFlagsLoading = useAreFlagsLoading()
    const { hiddenNotificationTypes } =
        useAutomateNotificationSettingsVisibility()

    const resolvedCategories = useMemo(() => {
        const hiddenNotificationTypesSet = new Set(hiddenNotificationTypes)

        return categories.reduce<ResolvedCategory[]>((acc, category) => {
            const notificationTypes = (category.notifications || []).filter(
                (notificationType) =>
                    !hiddenNotificationTypesSet.has(notificationType),
            )

            if (notificationTypes.length === 0) {
                return acc
            }

            acc.push({
                category,
                notificationTypes,
            })

            return acc
        }, [])
    }, [hiddenNotificationTypes])

    if (areFlagsLoading) {
        return null
    }

    return (
        <>
            {resolvedCategories.map(({ category, notificationTypes }) => (
                <Fragment key={category.type}>
                    <h2 className={css.heading}>{category.label}</h2>
                    <p className={css.subtitle}>{category.description}</p>

                    <TableWrapper className={css.container}>
                        <EventSettingsTableHead
                            typeHeader={category.typeLabel}
                        />
                        <TableBody>
                            {notificationTypes.map((notificationType) => (
                                <EventSettingsRow
                                    key={notificationType}
                                    config={notifications[notificationType]}
                                    setting={settings.events[notificationType]}
                                    onChangeChannel={(channel, value) => {
                                        onChangeChannel(
                                            notificationType,
                                            channel,
                                            value,
                                        )
                                    }}
                                    onChangeSound={(sound) => {
                                        onChangeSound(notificationType, sound)
                                    }}
                                />
                            ))}
                        </TableBody>
                    </TableWrapper>
                </Fragment>
            ))}
        </>
    )
}
