import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { TicketChannel } from 'business/types/ticket'
import { IntegrationType } from 'models/integration/types'
import type { GorgiasChatIntegration } from 'models/integration/types/gorgiasChat'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'

import { ChannelSelector } from './ChannelSelector'

const captured: {
    onChange: ((item: { id: number; label: string }) => void) | undefined
    value: { id: number; label: string } | undefined
} = {
    onChange: undefined,
    value: undefined,
}

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    SelectField: ({
        onChange,
        value,
        items,
        children,
        'aria-label': ariaLabel,
    }: any) => {
        captured.onChange = onChange
        captured.value = value
        return (
            <div aria-label={ariaLabel}>
                {items?.map((item: any) => (
                    <span key={item.id}>{children(item)}</span>
                ))}
            </div>
        )
    },
    ListItem: ({ label }: any) => <span>{label}</span>,
}))

const makeChannel = (id: number, name: string): SelfServiceChatChannel => ({
    type: TicketChannel.Chat,
    value: {
        id,
        name,
        type: IntegrationType.GorgiasChat,
        meta: { app_id: `app-${id}` },
    } as GorgiasChatIntegration,
})

const channelA = makeChannel(1, 'Chat A')
const channelB = makeChannel(2, 'Chat B')
const channelC = makeChannel(3, 'Chat C')
const channels = [channelA, channelB, channelC]

const onSelect = jest.fn()

const renderComponent = (selectedChannel = channelA) =>
    render(
        <ChannelSelector
            channels={channels}
            selectedChannel={selectedChannel}
            onSelect={onSelect}
        />,
    )

describe('<ChannelSelector />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        captured.onChange = undefined
        captured.value = undefined
    })

    it('renders all channel labels', () => {
        renderComponent()

        expect(screen.getByText('Chat A')).toBeInTheDocument()
        expect(screen.getByText('Chat B')).toBeInTheDocument()
        expect(screen.getByText('Chat C')).toBeInTheDocument()
    })

    it('passes the matched channel option as value', () => {
        renderComponent(channelB)

        expect(captured.value).toEqual({ id: 2, label: 'Chat B' })
    })

    it('falls back to the first option when selected channel id does not match', () => {
        const unknownChannel = makeChannel(99, 'Unknown')

        renderComponent(unknownChannel)

        expect(captured.value).toEqual({ id: 1, label: 'Chat A' })
    })

    it('renders with the correct aria-label', () => {
        renderComponent()

        expect(
            screen.getByRole('generic', { name: 'Channel selector' }),
        ).toBeInTheDocument()
    })

    it('calls onSelect with the matching channel when onChange fires', () => {
        renderComponent()

        captured.onChange?.({ id: 2, label: 'Chat B' })

        expect(onSelect).toHaveBeenCalledWith(channelB)
    })

    it('calls onSelect with the first channel when onChange fires with the first channel option', () => {
        renderComponent(channelB)

        captured.onChange?.({ id: 1, label: 'Chat A' })

        expect(onSelect).toHaveBeenCalledWith(channelA)
    })
})
