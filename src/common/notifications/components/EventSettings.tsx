import cn from 'classnames'
import React from 'react'
import {Tooltip} from '@gorgias/ui-kit'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import CheckBox from 'pages/common/forms/CheckBox'
import SourceIcon from 'pages/common/components/SourceIcon'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import {SoundValue} from 'services/NotificationSounds'
import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'

import useAvailableEvents from '../hooks/useAvailableEvents'
import {channels, ticketMessageCreatedEvents} from '../data'
import {NotificationType, Settings} from '../types'

import EventSettingsTableHead from './EventSettingsTableHead'
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

    const isTicketMessageCreatedEnabled = useFlag(
        FeatureFlagKey.NotificationsTicketMessageCreated,
        false
    )

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
                                                'ticket-message.created' &&
                                            !isTicketMessageCreatedEnabled
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
                            {!isTicketMessageCreatedEnabled && (
                                <Tooltip target="checkbox">
                                    This setting cannot be deselected
                                </Tooltip>
                            )}
                        </TableBodyRow>
                    ))}
                </TableBody>
            </TableWrapper>

            {isTicketMessageCreatedEnabled && (
                <>
                    <h2 className={css.heading}>New messages</h2>
                    <p className={css.subtitle}>
                        Get notified when you receive new messages from these
                        channels.
                    </p>
                    <TableWrapper className={css.container}>
                        <EventSettingsTableHead typeHeader="Message channel" />
                        <TableBody>
                            {ticketMessageCreatedEvents.map((event) => (
                                <TableBodyRow key={event.type}>
                                    <BodyCell innerClassName={css.bodyCell}>
                                        {event.icon && (
                                            <SourceIcon
                                                type={event.icon}
                                                className={
                                                    css.ticketChannelIcon
                                                }
                                            />
                                        )}
                                        {event.label}
                                        {event.tooltip && (
                                            <IconTooltip
                                                className={css.tooltip}
                                            >
                                                {event.tooltip}
                                            </IconTooltip>
                                        )}
                                    </BodyCell>
                                    <BodyCell
                                        innerClassName={cn(
                                            css.bodyCell,
                                            css.soundSelectCell
                                        )}
                                    >
                                        <SoundSelect
                                            addEmptyValue
                                            value={
                                                settings.events[event.type]
                                                    ?.sound
                                            }
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
                                                isChecked={
                                                    settings.events[event.type]
                                                        ?.channels?.[
                                                        channel.type
                                                    ] || false
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
                                </TableBodyRow>
                            ))}
                        </TableBody>
                    </TableWrapper>
                </>
            )}
        </>
    )
}
