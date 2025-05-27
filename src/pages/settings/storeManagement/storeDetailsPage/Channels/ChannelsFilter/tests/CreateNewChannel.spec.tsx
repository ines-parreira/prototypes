import React from 'react'

import { screen } from '@testing-library/react'

import { renderWithRouter } from 'utils/testing'

import { ChannelTypes, ChannelWithMetadata } from '../../../../types'
import CreateNewChannel from '../CreateNewChannel'

const createMockChannel = (type: ChannelTypes): ChannelWithMetadata => ({
    title: `${type} channel`,
    description: '',
    count: 0,
    type,
    assignedChannels: [],
    unassignedChannels: [],
})

describe('CreateNewChannel', () => {
    it('should render nothing when no active channel is provided', () => {
        renderWithRouter(<CreateNewChannel />)
        expect(screen.queryByText(/Add New/)).not.toBeInTheDocument()
    })

    it('should render email channel link correctly', () => {
        const activeChannel = createMockChannel('email')
        renderWithRouter(<CreateNewChannel activeChannel={activeChannel} />)
        expect(screen.getByText(/add new email/i)).toHaveAttribute(
            'to',
            '/app/settings/channels/email',
        )
    })

    it('should render chat channel link correctly', () => {
        const activeChannel = createMockChannel('chat')
        renderWithRouter(<CreateNewChannel activeChannel={activeChannel} />)

        expect(screen.getByText(/add new chat/i)).toHaveAttribute(
            'to',
            '/app/settings/channels/chat',
        )
    })

    it('should render whatsApp channel link correctly', () => {
        const activeChannel = createMockChannel('whatsApp')
        renderWithRouter(<CreateNewChannel activeChannel={activeChannel} />)

        expect(screen.getByText(/add new whatsapp/i)).toHaveAttribute(
            'to',
            '/app/settings/channels/whatsapp',
        )
    })

    it('should render help center channel link correctly', () => {
        const activeChannel = createMockChannel('helpCenter')
        renderWithRouter(<CreateNewChannel activeChannel={activeChannel} />)

        expect(screen.getByText(/add new help center/i)).toHaveAttribute(
            'to',
            '/app/settings/channels/help-center',
        )
    })

    it('should render contact form channel link correctly', () => {
        const activeChannel = createMockChannel('contactForm')
        renderWithRouter(<CreateNewChannel activeChannel={activeChannel} />)

        expect(screen.getByText(/add new contact form/i)).toHaveAttribute(
            'to',
            '/app/settings/channels/contact-form',
        )
    })

    it('should render voice channel link correctly', () => {
        const activeChannel = createMockChannel('voice')
        renderWithRouter(<CreateNewChannel activeChannel={activeChannel} />)

        expect(screen.getByText(/add new phone/i)).toHaveAttribute(
            'to',
            '/app/settings/channels/phone',
        )
    })

    it('should render SMS channel link correctly', () => {
        const activeChannel = createMockChannel('sms')
        renderWithRouter(<CreateNewChannel activeChannel={activeChannel} />)

        expect(screen.getByText(/add new sms/i)).toHaveAttribute(
            'to',
            '/app/settings/channels/sms',
        )
    })

    it('should render facebook channel link correctly', () => {
        const activeChannel = createMockChannel('facebook')
        renderWithRouter(<CreateNewChannel activeChannel={activeChannel} />)

        expect(screen.getByText(/add new facebook/i)).toHaveAttribute(
            'to',
            '/app/settings/channels/facebook',
        )
    })

    it('should render tiktok shop channel link correctly', () => {
        const activeChannel = createMockChannel('tiktokShop')
        renderWithRouter(<CreateNewChannel activeChannel={activeChannel} />)

        expect(screen.getByText(/add new tiktok shop/i)).toHaveAttribute(
            'to',
            '/app/settings/channels/tiktok-shop',
        )
    })
})
