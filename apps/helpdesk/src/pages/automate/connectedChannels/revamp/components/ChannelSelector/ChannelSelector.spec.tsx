import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TicketChannel } from 'business/types/ticket'
import { IntegrationType } from 'models/integration/types'
import type { GorgiasChatIntegration } from 'models/integration/types/gorgiasChat'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'

import { ChannelSelector } from './ChannelSelector'

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
    })

    it('renders all channel labels when the dropdown is open', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(
            screen.getByRole('textbox', { name: 'Channel selector' }),
        )

        expect(
            await screen.findByRole('option', { name: 'Chat A' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: 'Chat B' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: 'Chat C' }),
        ).toBeInTheDocument()
    })

    it('displays the matched channel as the selected value', () => {
        renderComponent(channelB)

        expect(
            screen.getByRole('textbox', { name: 'Channel selector' }),
        ).toHaveValue('Chat B')
    })

    it('falls back to the first option when selected channel id does not match', () => {
        const unknownChannel = makeChannel(99, 'Unknown')

        renderComponent(unknownChannel)

        expect(
            screen.getByRole('textbox', { name: 'Channel selector' }),
        ).toHaveValue('Chat A')
    })

    it('calls onSelect with the matching channel when an option is selected', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(
            screen.getByRole('textbox', { name: 'Channel selector' }),
        )
        await user.click(await screen.findByRole('option', { name: 'Chat B' }))

        expect(onSelect).toHaveBeenCalledWith(channelB)
    })

    it('calls onSelect with the first channel when the first option is selected', async () => {
        const user = userEvent.setup()
        renderComponent(channelB)

        await user.click(
            screen.getByRole('textbox', { name: 'Channel selector' }),
        )
        await user.click(await screen.findByRole('option', { name: 'Chat A' }))

        expect(onSelect).toHaveBeenCalledWith(channelA)
    })
})
