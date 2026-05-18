import { useMemo } from 'react'

import { reportError } from '@repo/logging'

import { ListItem, SelectField } from '@gorgias/axiom'

import type { SelfServiceChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'

type ChannelOption = {
    id: number
    label: string
}

interface Props<T extends SelfServiceChannel> {
    channels: T[]
    selectedChannel: T
    onSelect: (channel: T) => void
}

export const ChannelSelector = <T extends SelfServiceChannel>({
    channels,
    selectedChannel,
    onSelect,
}: Props<T>) => {
    const items: ChannelOption[] = useMemo(
        () =>
            channels.map((c) => ({
                id: c.value.id,
                label: c.value.name,
            })),
        [channels],
    )

    const value = useMemo(
        () =>
            items.find((item) => item.id === selectedChannel.value.id) ??
            items.at(0),
        [selectedChannel, items],
    )

    const handleOnChange = (channelOption: ChannelOption) => {
        const channel = channels.find((c) => c.value.id === channelOption.id)
        if (!channel) {
            reportError(
                new Error(
                    `ChannelSelector: selected channel option ${channelOption.id} not found in channels`,
                ),
            )
            return
        }
        onSelect(channel)
    }

    return (
        <SelectField<ChannelOption>
            items={items}
            value={value}
            onChange={handleOnChange}
            placeholder="Select a channel"
            aria-label="Channel selector"
        >
            {(item: ChannelOption) => (
                <ListItem id={item.id} label={item.label} />
            )}
        </SelectField>
    )
}
