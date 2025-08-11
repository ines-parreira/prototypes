import { useCallback, useMemo, useRef, useState } from 'react'

import classNames from 'classnames'

import { Button, Separator } from '@gorgias/axiom'

import { IntegrationType } from 'models/integration/constants'
import { getIntegrationDisplayName } from 'state/integrations/helpers'

import Dropdown from '../dropdown/Dropdown'
import DropdownBody from '../dropdown/DropdownBody'
import DropdownItem from '../dropdown/DropdownItem'
import DropdownSearch from '../dropdown/DropdownSearch'
import SourceIcon from '../SourceIcon'

import css from './ChannelFilter.less'

type Props = {
    channels: IntegrationType[]
    onChange: (value: string[] | null) => void
    withSearch?: boolean
}

const ALL_CHANNELS_LABEL = 'All Channels'

const mapChannelToIntegrationType = (
    channel: IntegrationType,
): IntegrationType[] => {
    if (channel === IntegrationType.Email) {
        return [
            IntegrationType.Email,
            IntegrationType.Gmail,
            IntegrationType.Outlook,
        ]
    }
    return [channel]
}

export default function ChannelFilter({
    channels,
    onChange,
    withSearch = false,
}: Props) {
    const channelsData = useMemo(() => {
        return channels.map((type) => {
            return { key: type, label: getIntegrationDisplayName(type) }
        })
    }, [channels])

    const [isOpen, setIsOpen] = useState(false)
    const targetRef = useRef<HTMLButtonElement | null>(null)

    const [selected, setSelected] = useState<string | null>(null)

    const handleClickButton = useCallback(() => {
        setIsOpen((o) => !o)
    }, [])

    return (
        <>
            <Button
                intent="secondary"
                ref={targetRef}
                onClick={handleClickButton}
            >
                <span className={classNames(css.spacer, css.button)}>
                    {selected && (
                        <SourceIcon type={selected} className={css.icon} />
                    )}
                    <span className={css.buttonTextContent}>
                        {selected === null
                            ? ALL_CHANNELS_LABEL
                            : getIntegrationDisplayName(
                                  selected as IntegrationType,
                              )}
                    </span>
                    <i className="material-icons">arrow_drop_down</i>
                </span>
            </Button>
            <Dropdown
                isOpen={isOpen}
                placement="bottom-end"
                target={targetRef}
                onToggle={setIsOpen}
                value={selected}
            >
                {withSearch && <DropdownSearch autoFocus />}
                <DropdownBody>
                    <DropdownItem
                        key="all"
                        option={{
                            label: ALL_CHANNELS_LABEL,
                            value: null,
                        }}
                        onClick={() => {
                            setSelected(null)
                            onChange(null)
                        }}
                        shouldCloseOnSelect
                        alwaysVisible
                    >
                        <span className={css.spacer}>
                            <div className={css.icon} />
                            {ALL_CHANNELS_LABEL}
                        </span>
                    </DropdownItem>
                    <Separator />
                    {channelsData.map((channel) => (
                        <DropdownItem
                            key={channel.key}
                            option={{
                                label: channel.label,
                                value: channel.key,
                            }}
                            onClick={() => {
                                setSelected(channel.key)
                                onChange(
                                    mapChannelToIntegrationType(channel.key),
                                )
                            }}
                            shouldCloseOnSelect
                        >
                            <span className={css.spacer}>
                                <SourceIcon
                                    type={channel.key}
                                    className={css.icon}
                                />
                                {channel.label}
                            </span>
                        </DropdownItem>
                    ))}
                </DropdownBody>
            </Dropdown>
        </>
    )
}
