import React from 'react'
import {render, screen} from '@testing-library/react'
import {TicketChannel} from 'business/types/ticket'
import ChannelIcon from '../ChannelIcon'

describe('ChannelIcon', () => {
    test('renders Chat icon correctly', () => {
        render(<ChannelIcon type={TicketChannel.Chat} />)
        const iconElement = screen.getByText('forum')
        expect(iconElement).toBeInTheDocument()
    })

    test('renders HelpCenter icon correctly', () => {
        render(<ChannelIcon type={TicketChannel.HelpCenter} />)
        const iconElement = screen.getByText('live_help')
        expect(iconElement).toBeInTheDocument()
    })

    test('renders ContactForm icon correctly', () => {
        render(<ChannelIcon type={TicketChannel.ContactForm} />)
        const iconElement = screen.getByText('edit_note')
        expect(iconElement).toBeInTheDocument()
    })
})
