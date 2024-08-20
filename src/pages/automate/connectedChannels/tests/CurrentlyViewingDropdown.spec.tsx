import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'
import {SelfServiceChatChannel} from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import {TicketChannel} from 'business/types/ticket'
import {CurrentlyViewingDropdown} from '../components/CurrentlyViewingDropdown'

const renderOption = (channel: SelfServiceChatChannel) => ({
    label: channel.value.name,
    value: channel.value.meta.app_id ?? '',
})

const channels = [
    {label: 'Channel 1', value: 'channel-1'},
    {label: 'Channel 2', value: 'channel-2'},
]

const mockChannels = channels.map((channel) => ({
    type: TicketChannel.Chat,
    value: {
        id: channel.value,
        name: channel.label,
        meta: {
            app_id: channel.value,
        },
    },
})) as unknown as SelfServiceChatChannel[]

describe('CurrentlyViewingDropdown', () => {
    test('renders the component', () => {
        render(
            <CurrentlyViewingDropdown
                channelType="chat"
                value=""
                label="Select a Channel"
                channels={mockChannels}
                onConnect={jest.fn()}
                onSelectedChannelChange={jest.fn()}
                renderOption={renderOption}
            />
        )

        expect(screen.getByText('Currently viewing')).toBeInTheDocument()
        expect(screen.getByText('Select a Channel')).toBeInTheDocument()
    })

    test('opens the dropdown when button is clicked', () => {
        render(
            <CurrentlyViewingDropdown
                channelType="chat"
                value=""
                label="Select a Channel"
                channels={mockChannels}
                onConnect={jest.fn()}
                onSelectedChannelChange={jest.fn()}
                renderOption={renderOption}
            />
        )

        fireEvent.click(
            screen.getByRole('button', {name: /Currently viewing/i})
        )

        expect(screen.getByText('Channel 1')).toBeInTheDocument()
        expect(screen.getByText('Channel 2')).toBeInTheDocument()
    })

    test('calls onSelectedChannelChange when an item is clicked', () => {
        const onSelectedChannelChange = jest.fn()

        render(
            <CurrentlyViewingDropdown
                channelType="chat"
                value=""
                label="Select a Channel"
                channels={mockChannels}
                onConnect={jest.fn()}
                onSelectedChannelChange={onSelectedChannelChange}
                renderOption={renderOption}
            />
        )

        fireEvent.click(
            screen.getByRole('button', {name: /Currently viewing/i})
        )
        fireEvent.click(screen.getByText('Channel 1'))

        expect(onSelectedChannelChange).toHaveBeenCalledWith('channel-1')
    })
})
