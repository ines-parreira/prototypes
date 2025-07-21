import React from 'react'

import { render } from '@testing-library/react'

import { TicketChannel } from 'business/types/ticket'

import ChannelBlock from '../ChannelBlock'
import { ChannelConfig } from '../utils'

describe('ChannelBlock Component', () => {
    it('renders channel header correctly', () => {
        const { getByText } = render(
            <ChannelBlock channelType={TicketChannel.Chat}>
                <div>Children Component</div>
            </ChannelBlock>,
        )
        expect(getByText('Chat')).toBeInTheDocument()
    })

    it('renders children component', () => {
        const { getByText } = render(
            <ChannelBlock channelType={TicketChannel.Chat}>
                <div>Children Component</div>
            </ChannelBlock>,
        )
        expect(getByText('Children Component')).toBeInTheDocument()
    })

    it('renders channel preview image correctly', () => {
        const { getByAltText } = render(
            <ChannelBlock channelType={TicketChannel.Chat}>
                <div>Children Component</div>
            </ChannelBlock>,
        )
        expect(getByAltText('Feature preview')).toHaveAttribute(
            'src',
            ChannelConfig[TicketChannel.Chat].assetsUrl,
        )
    })

    it('renders channel preview description correctly', () => {
        const { getByText } = render(
            <ChannelBlock channelType={TicketChannel.HelpCenter}>
                <div>Children Component</div>
            </ChannelBlock>,
        )
        expect(
            getByText('Example: Flows visible in Help Center'),
        ).toBeInTheDocument()
    })
})
