import cn from 'classnames'
import React from 'react'
import {Tooltip} from '@gorgias/ui-kit'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import CheckBox from 'pages/common/forms/CheckBox'
import {SoundValue} from 'services/NotificationSounds'

import useAvailableEvents from '../hooks/useAvailableEvents'
import {channels} from '../data'
import {NotificationType, Settings} from '../types'

import SoundSelect from './SoundSelect'
import css from './EventSettings.less'

type Props = {
    settings: Settings
    onChangeChannel: (
        notificationType: NotificationType,
        channel: string,
        value: boolean
    ) => void
    onChangeSound: (
        notificationType: NotificationType,
        sound: '' | SoundValue
    ) => void
}

export default function EventSettings({
    settings,
    onChangeChannel,
    onChangeSound,
}: Props) {
    const availableEvents = useAvailableEvents()

    return (
        <>
            <h2 className={css.heading}>Ticket updates</h2>
            <p className={css.subtitle}>
                Get notified when one of these events happen:
            </p>

            <TableWrapper className={css.container}>
                <TableHead>
                    <HeaderCell className={css.headingCell}>Event</HeaderCell>
                    <HeaderCell className={css.headingCell}>Sound</HeaderCell>
                    {channels.map((channel) => (
                        <HeaderCell
                            key={channel.type}
                            className={css.headingCell}
                        >
                            {channel.label}
                        </HeaderCell>
                    ))}
                </TableHead>
                <TableBody>
                    {availableEvents.map((event) => (
                        <TableBodyRow key={event.type}>
                            <BodyCell innerClassName={css.bodyCell}>
                                {event.label}
                            </BodyCell>
                            <BodyCell
                                innerClassName={cn(
                                    css.bodyCell,
                                    css.soundSelectCell
                                )}
                            >
                                <SoundSelect
                                    addEmptyValue
                                    value={settings.events[event.type]?.sound}
                                    onChange={(sound) => {
                                        onChangeSound(event.type, sound)
                                    }}
                                    disabled={
                                        !Object.values(
                                            settings.events[event.type]
                                                ?.channels || {}
                                        ).some((value) => !!value)
                                    }
                                />
                            </BodyCell>
                            {channels.map((channel) => (
                                <BodyCell
                                    key={channel.type}
                                    innerClassName={css.bodyCell}
                                >
                                    <CheckBox
                                        name={
                                            event.type ===
                                            'ticket-message.created'
                                                ? 'checkbox'
                                                : undefined
                                        }
                                        isDisabled={
                                            event.type ===
                                            'ticket-message.created'
                                        }
                                        isChecked={
                                            settings.events[event.type]
                                                ?.channels?.[channel.type] ||
                                            false
                                        }
                                        onChange={(e) => {
                                            onChangeChannel(
                                                event.type,
                                                channel.type,
                                                e
                                            )
                                        }}
                                    />
                                </BodyCell>
                            ))}
                            <Tooltip target="checkbox">
                                This setting cannot be deselected
                            </Tooltip>
                        </TableBodyRow>
                    ))}
                </TableBody>
            </TableWrapper>
        </>
    )
}
