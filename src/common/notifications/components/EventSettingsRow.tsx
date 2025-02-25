import React from 'react'

import cn from 'classnames'

import SourceIcon from 'pages/common/components/SourceIcon'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import CheckBox from 'pages/common/forms/CheckBox'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import type { SoundValue } from 'services/NotificationSounds'

import { channels } from '../data'
import type { NotificationConfig, Setting } from '../types'
import SoundSelect from './SoundSelect'

import css from './EventSettingsRow.less'

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

    const { icon, label, tooltip } = config.settings

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
                    value={
                        setting?.sound !== undefined ? setting.sound : 'default'
                    }
                    onChange={onChangeSound}
                    disabled={
                        !Object.values(setting?.channels || {}).some(
                            (value) => !!value,
                        )
                    }
                />
            </BodyCell>
            {channels.map((channel) => (
                <BodyCell key={channel.type} innerClassName={css.bodyCell}>
                    <CheckBox
                        isChecked={!!setting?.channels?.[channel.type]}
                        onChange={(value) => {
                            onChangeChannel(channel.type, value)
                        }}
                    />
                </BodyCell>
            ))}
        </TableBodyRow>
    )
}
