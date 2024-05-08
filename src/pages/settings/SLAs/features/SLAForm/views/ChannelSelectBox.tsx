import React, {forwardRef, useCallback, useMemo, useRef, useState} from 'react'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import Label from 'pages/common/forms/Label/Label'
import {getChannels} from 'services/channels'
import {Channel} from 'models/channel/types'

type ChannelSelectBoxProps = {
    value: Channel['slug'][] | undefined
    onChange: (value: Channel['slug'][]) => void
}

export default forwardRef(function ChannelSelectBox({
    value,
    onChange,
}: ChannelSelectBoxProps) {
    const channelSelectId = 'channel-select'
    const floatingRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState(false)
    const channelsMap = getChannels()
        .sort((a, b) => a.name.localeCompare(b.name))
        .reduce((acc, channel) => {
            return {
                ...acc,
                [channel.slug]: {
                    label: channel.name,
                    value: channel.slug,
                },
            }
        }, {} as Record<Channel['slug'], {label: Channel['name']; value: Channel['slug']}>)

    const channelsLabel = useMemo(() => {
        if (value && value.length > 5) {
            return `${value.length} channels`
        }

        return value
            ?.reduce((acc: string[], slug) => {
                const channel = channelsMap[slug]
                if (channel) {
                    acc.push(channel.label)
                }
                return acc
            }, [])
            .join(', ')
    }, [channelsMap, value])

    const handleChannelChange = useCallback(
        (nextValue: Channel['slug']) => {
            if (value?.includes(nextValue)) {
                onChange(value.filter((v) => v !== nextValue))
            } else {
                onChange([...(value || []), nextValue])
            }
        },
        [onChange, value]
    )

    return (
        <>
            <Label htmlFor={channelSelectId}>Channel(s)</Label>
            <SelectInputBox
                placeholder="Select channels the SLA should apply to"
                id={channelSelectId}
                floating={floatingRef}
                ref={targetRef}
                onToggle={setIsOpen}
                label={channelsLabel}
            >
                <SelectInputBoxContext.Consumer>
                    {(context) => (
                        <Dropdown
                            isOpen={isOpen}
                            onToggle={() => context!.onBlur()}
                            ref={floatingRef}
                            target={targetRef}
                            value={value}
                            isMultiple
                        >
                            <DropdownBody>
                                {Object.values(channelsMap).map((channel) => {
                                    return (
                                        <DropdownItem
                                            key={channel.label}
                                            option={channel}
                                            onClick={handleChannelChange}
                                            shouldCloseOnSelect
                                        />
                                    )
                                })}
                            </DropdownBody>
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
        </>
    )
})
