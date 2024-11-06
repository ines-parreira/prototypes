import {Tooltip} from '@gorgias/merchant-ui-kit'
import cn from 'classnames'
import React from 'react'

import SourceIcon from 'pages/common/components/SourceIcon'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import CheckBox from 'pages/common/forms/CheckBox'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import type {SoundValue} from 'services/NotificationSounds'

import {channels} from '../data'
import type {NotificationConfig, Setting} from '../types'
import css from './EventSettingsRow.less'
import SoundSelect from './SoundSelect'

type Props = {
    config: NotificationConfig
    setting?: Setting
    onChangeChannel: (channel: string, value: boolean) => void
    onChangeSound: (sound: '' | SoundValue) => void
}

export default function EventSettingsRow({
    config,
    setting,
    onChangeChannel,
    onChangeSound,
}: Props) {
    if (!config.settings) return null

    const {icon, label, tooltip} = config.settings

    return (
        <TableBodyRow>
            <BodyCell innerClassName={css.bodyCell}>
                {icon && (
                    <SourceIcon type={icon} className={css.ticketChannelIcon} />
                )}
                {label}
                {tooltip && (
                    <IconTooltip className={css.tooltip}>{tooltip}</IconTooltip>
                )}
            </BodyCell>
            <BodyCell innerClassName={cn(css.bodyCell, css.soundSelectCell)}>
                <SoundSelect
                    addEmptyValue
                    value={setting?.sound || 'default'}
                    onChange={onChangeSound}
                    disabled={
                        !Object.values(setting?.channels || {}).some(
                            (value) => !!value
                        )
                    }
                />
            </BodyCell>
            {channels.map((channel) => (
                <BodyCell key={channel.type} innerClassName={css.bodyCell}>
                    <CheckBox
                        name={
                            config.type === 'legacy-chat-and-messaging'
                                ? 'legacy'
                                : undefined
                        }
                        isDisabled={config.type === 'legacy-chat-and-messaging'}
                        isChecked={!!setting?.channels?.[channel.type]}
                        onChange={(value) => {
                            config.type !== 'legacy-chat-and-messaging' &&
                                onChangeChannel(channel.type, value)
                        }}
                    />
                </BodyCell>
            ))}
            {config.type === 'legacy-chat-and-messaging' && (
                <Tooltip target="legacy">
                    This setting cannot be deselected
                </Tooltip>
            )}
        </TableBodyRow>
    )
}
