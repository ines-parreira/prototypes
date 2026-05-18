import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import classNames from 'classnames'

import type { SelfServiceChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import ChannelIcon from '../ChannelIcon'

import css from './SelfServicePreviewChannelSelect.less'

type Props<T extends SelfServiceChannel> = {
    channel?: T
    onChange: (channel?: T) => void
    channels: T[]
    className?: string
    isDisabled?: boolean
}

const SelfServicePreviewChannelSelect = <T extends SelfServiceChannel>({
    channel,
    onChange,
    channels,
    className,
    isDisabled,
}: Props<T>) => {
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)
    const [isSelectOpen, setIsSelectOpen] = useState(false)

    const options = useMemo(
        () =>
            channels.map((channel) => ({
                type: channel.type,
                value: `${channel.type}:${channel.value.id}`,
                label: channel.value.name,
                channel,
            })),
        [channels],
    )

    useEffect(() => {
        const first = channels.at(0)
        if (!first) return
        if (
            !channel ||
            !channels.find((c) => c.value.id === channel.value.id)
        ) {
            onChange(first)
        }
    }, [channel, channels, onChange])

    const handleChange = useCallback(
        (nextValue: string) => {
            onChange(
                options.find((option) => option.value === nextValue)?.channel,
            )
        },
        [onChange, options],
    )

    const value = useMemo(() => {
        return channel ? `${channel.type}:${channel.value.id}` : undefined
    }, [channel])

    const prefix = useMemo(() => {
        return channel && <ChannelIcon type={channel.type} />
    }, [channel])

    return (
        <SelectInputBox
            className={classNames(css.input, className)}
            placeholder="Channel"
            floating={floatingRef}
            label={channel?.value?.name}
            onToggle={setIsSelectOpen}
            ref={targetRef}
            isDisabled={!channels.length || isDisabled}
            prefix={prefix}
        >
            <SelectInputBoxContext.Consumer>
                {(context) => (
                    <Dropdown
                        isOpen={isSelectOpen}
                        isDisabled={!channels.length}
                        onToggle={() => context!.onBlur()}
                        ref={floatingRef}
                        target={targetRef}
                        value={value}
                    >
                        <DropdownBody>
                            {options.map((option) => (
                                <DropdownItem
                                    key={option.value}
                                    option={option}
                                    onClick={handleChange}
                                    shouldCloseOnSelect
                                >
                                    <ChannelIcon type={option.type} />
                                    <span className={css.itemLabel}>
                                        {option.label}
                                    </span>
                                </DropdownItem>
                            ))}
                        </DropdownBody>
                    </Dropdown>
                )}
            </SelectInputBoxContext.Consumer>
        </SelectInputBox>
    )
}

export default SelfServicePreviewChannelSelect
