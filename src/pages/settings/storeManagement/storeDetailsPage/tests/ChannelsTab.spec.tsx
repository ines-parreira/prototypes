import React from 'react'

import { render, screen } from '@testing-library/react'

import ChannelsTab from '../ChannelsTab'

describe('ChannelsTab', () => {
    it('renders the channels section with correct title and description', () => {
        render(<ChannelsTab />)

        expect(screen.getByText('Channels')).toBeInTheDocument()
        expect(
            screen.getByText('View and manage your channels for this store.'),
        ).toBeInTheDocument()
    })

    it('renders all channel types with correct counts', () => {
        render(<ChannelsTab />)

        expect(screen.getByText('Email')).toBeInTheDocument()
        expect(screen.getByText('Chat')).toBeInTheDocument()
        expect(screen.getByText('Help Center')).toBeInTheDocument()
        expect(screen.getByText('Contact Form')).toBeInTheDocument()
        expect(screen.getByText('WhatsApp')).toBeInTheDocument()
        expect(
            screen.getByText('Facebook, Messenger & Instagram'),
        ).toBeInTheDocument()
        expect(screen.getByText('TikTok Shop')).toBeInTheDocument()
    })
})
