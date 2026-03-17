import { ListItem, SelectField } from '@gorgias/axiom'

import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'

type ChannelOption = {
    id: number
    label: string
}

interface Props {
    chatChannels: SelfServiceChatChannel[]
    selectedChannelId: number | undefined
    onSelect: (channelId: number) => void
}

export const ChatChannelSelector = ({
    chatChannels,
    selectedChannelId,
    onSelect,
}: Props) => {
    const items: ChannelOption[] = chatChannels.map((c) => ({
        id: c.value.id,
        label: c.value.name,
    }))

    const value =
        items.find((item) => item.id === selectedChannelId) ?? items[0]

    return (
        <SelectField<ChannelOption>
            items={items}
            value={value}
            onChange={(item) => item && onSelect(item.id)}
            placeholder="Select a channel"
            aria-label="Chat channel selector"
        >
            {(item) => <ListItem id={item.id} label={item.label} />}
        </SelectField>
    )
}
