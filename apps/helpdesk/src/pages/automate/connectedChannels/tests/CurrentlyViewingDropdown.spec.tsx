import React from 'react'

import { fireEvent, screen } from '@testing-library/react'

import { TicketChannel } from 'business/types/ticket'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'
import { renderWithRouter } from 'utils/testing'

import { CurrentlyViewingDropdown } from '../components/CurrentlyViewingDropdown'

const renderOption = (channel: SelfServiceChatChannel) => ({
    label: channel.value.name,
    value: channel.value.meta.app_id ?? '',
})

const channels = [
    { label: 'Channel 1', value: 'channel-1' },
    { label: 'Channel 2', value: 'channel-2' },
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

// Mock the useIsAutomateSettings hook
jest.mock('settings/automate/hooks/useIsAutomateSettings', () => ({
    useIsAutomateSettings: jest.fn(),
}))

// Cast the mock to a jest mock function for type safety
const mockUseIsAutomateSettings = useIsAutomateSettings as jest.Mock

describe('CurrentlyViewingDropdown', () => {
    beforeEach(() => {
        // Reset the mock before each test
        mockUseIsAutomateSettings.mockReset()
        mockUseIsAutomateSettings.mockReturnValue(false)
    })

    test('renders the component', () => {
        renderWithRouter(
            <CurrentlyViewingDropdown
                channelType="chat"
                value=""
                appId="123"
                label="Select a Channel"
                channels={mockChannels}
                onConnect={jest.fn()}
                onSelectedChannelChange={jest.fn()}
                renderOption={renderOption}
            />,
        )

        expect(screen.getByText('Currently viewing')).toBeInTheDocument()
        expect(screen.getByText('Select a Channel')).toBeInTheDocument()
    })

    test('opens the dropdown when button is clicked', () => {
        renderWithRouter(
            <CurrentlyViewingDropdown
                channelType="chat"
                value=""
                appId="123"
                label="Select a Channel"
                channels={mockChannels}
                onConnect={jest.fn()}
                onSelectedChannelChange={jest.fn()}
                renderOption={renderOption}
            />,
        )

        fireEvent.click(
            screen.getByRole('button', { name: /Currently viewing/i }),
        )

        expect(screen.getByText('Channel 1')).toBeInTheDocument()
        expect(screen.getByText('Channel 2')).toBeInTheDocument()
    })

    test('calls onSelectedChannelChange when an item is clicked', () => {
        const onSelectedChannelChange = jest.fn()

        renderWithRouter(
            <CurrentlyViewingDropdown
                channelType="chat"
                value=""
                appId="123"
                label="Select a Channel"
                channels={mockChannels}
                onConnect={jest.fn()}
                onSelectedChannelChange={onSelectedChannelChange}
                renderOption={renderOption}
            />,
        )

        fireEvent.click(
            screen.getByRole('button', { name: /Currently viewing/i }),
        )
        fireEvent.click(screen.getByText('Channel 1'))

        expect(onSelectedChannelChange).toHaveBeenCalledWith('channel-1')
    })

    it('opens the correct link when clicked on "Chat Settings" link', () => {
        renderWithRouter(
            <CurrentlyViewingDropdown
                channelType="chat"
                value=""
                appId="123"
                label="Select a Channel"
                channels={mockChannels}
                onConnect={jest.fn()}
                onSelectedChannelChange={jest.fn()}
                renderOption={renderOption}
            />,
        )

        expect(screen.getByText('Chat Settings')).toBeInTheDocument()
        expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            '/app/settings/channels/gorgias_chat/123',
        )
    })

    it('opens the correct link when clicked on "Help Center" link', () => {
        renderWithRouter(
            <CurrentlyViewingDropdown
                channelType="help-center"
                value=""
                appId="123"
                label="Select a Channel"
                channels={mockChannels}
                onConnect={jest.fn()}
                onSelectedChannelChange={jest.fn()}
                renderOption={renderOption}
            />,
        )
        expect(screen.getByText('Help Center Settings')).toBeInTheDocument()
        expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            '/app/settings/help-center/123/articles',
        )
    })

    it('opens the correct link when clicked on "Contact Form" link', () => {
        renderWithRouter(
            <CurrentlyViewingDropdown
                channelType="contact-form"
                value=""
                appId="123"
                label="Select a Channel"
                channels={mockChannels}
                onConnect={jest.fn()}
                onSelectedChannelChange={jest.fn()}
                renderOption={renderOption}
            />,
        )
        expect(screen.getByText('Contact Form Settings')).toBeInTheDocument()
        expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            '/app/settings/contact-form/123',
        )
    })

    describe('Automate Settings View', () => {
        beforeEach(() => {
            mockUseIsAutomateSettings.mockReturnValue(true)
        })

        it('shows grouped channels when in automate settings', () => {
            renderWithRouter(
                <CurrentlyViewingDropdown
                    channelType="chat"
                    value=""
                    appId="123"
                    label="Select a Channel"
                    channels={mockChannels}
                    onConnect={jest.fn()}
                    onSelectedChannelChange={jest.fn()}
                    renderOption={renderOption}
                />,
            )

            fireEvent.click(
                screen.getByRole('button', { name: /Currently viewing/i }),
            )

            expect(screen.getByText('Chat')).toBeInTheDocument()
            expect(screen.getByText('Help Center')).toBeInTheDocument()
            expect(screen.getByText('Contact Form')).toBeInTheDocument()
        })

        it('shows "Go to" link when channel group is empty', () => {
            renderWithRouter(
                <CurrentlyViewingDropdown
                    channelType="help-center"
                    value=""
                    appId="123"
                    label="Select a Channel"
                    channels={[]} // Empty channels array
                    onConnect={jest.fn()}
                    onSelectedChannelChange={jest.fn()}
                    renderOption={renderOption}
                />,
            )

            fireEvent.click(
                screen.getByRole('button', { name: /Currently viewing/i }),
            )

            expect(screen.getByText('Go to Chat')).toBeInTheDocument()
            expect(screen.getByText('Go to Help Center')).toBeInTheDocument()
            expect(screen.getByText('Go to Contact Form')).toBeInTheDocument()
        })
    })

    describe('Connect Call To Action', () => {
        it('shows connect CTA when showConnectCallToAction is true', () => {
            renderWithRouter(
                <CurrentlyViewingDropdown
                    channelType="chat"
                    value=""
                    appId="123"
                    label="Select a Channel"
                    channels={mockChannels}
                    showConnectCallToAction={true}
                    onConnect={jest.fn()}
                    onSelectedChannelChange={jest.fn()}
                    renderOption={renderOption}
                />,
            )

            fireEvent.click(
                screen.getByRole('button', { name: /Currently viewing/i }),
            )

            expect(
                screen.getByText(/Connect another Chat to this store/),
            ).toBeInTheDocument()
        })

        it('does not show connect CTA when showConnectCallToAction is false', () => {
            renderWithRouter(
                <CurrentlyViewingDropdown
                    channelType="chat"
                    value=""
                    appId="123"
                    label="Select a Channel"
                    channels={mockChannels}
                    showConnectCallToAction={false}
                    onConnect={jest.fn()}
                    onSelectedChannelChange={jest.fn()}
                    renderOption={renderOption}
                />,
            )

            fireEvent.click(
                screen.getByRole('button', { name: /Currently viewing/i }),
            )

            expect(
                screen.queryByText(/Connect another Chat to this store/),
            ).not.toBeInTheDocument()
        })
    })
})
