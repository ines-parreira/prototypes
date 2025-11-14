import React from 'react'

import { screen } from '@testing-library/react'

import { renderWithRouter } from 'utils/testing'

import { ChannelWithMetadata } from '../../../types'
import DrawerHeader from '../ChannelsDrawer/DrawerHeader'

describe('DrawerHeader', () => {
    const createChannel = (
        type: ChannelWithMetadata['type'],
    ): ChannelWithMetadata => ({
        title: '',
        description: '',
        count: 0,
        type,
        assignedChannels: [],
        unassignedChannels: [],
    })

    describe('content rendering', () => {
        it('renders email channel info correctly', () => {
            const channel = createChannel('email')
            renderWithRouter(<DrawerHeader channel={channel} />)

            expect(
                screen.getByText(
                    /Choose which support emails should be assigned to this store/i,
                ),
            ).toBeInTheDocument()

            expect(screen.getByText('Email settings.')).toHaveAttribute(
                'href',
                '/app/settings/channels/email',
            )
        })

        it('renders chat channel info correctly', () => {
            const channel = createChannel('chat')
            renderWithRouter(<DrawerHeader channel={channel} />)

            expect(
                screen.getByText(
                    /Choose which Chats that should be assigned to this store/i,
                ),
            ).toBeInTheDocument()

            expect(screen.getByText('Chat settings.')).toHaveAttribute(
                'href',
                '/app/settings/channels/gorgias_chat',
            )
        })

        it('renders helpCenter channel info correctly', () => {
            const channel = createChannel('helpCenter')
            renderWithRouter(<DrawerHeader channel={channel} />)

            expect(
                screen.getByText(
                    /Choose which Help Centers should be assigned to this store/i,
                ),
            ).toBeInTheDocument()

            expect(screen.getByText('Help Center settings.')).toHaveAttribute(
                'href',
                '/app/settings/help-center',
            )
        })

        it('renders contactForm channel info correctly', () => {
            const channel = createChannel('contactForm')
            renderWithRouter(<DrawerHeader channel={channel} />)

            expect(
                screen.getByText(
                    /Choose which Contact Forms should be assigned to this store/i,
                ),
            ).toBeInTheDocument()

            const linkElement = screen.getByText('Contact Form settings.')
            expect(linkElement).toBeInTheDocument()
            expect(linkElement).toHaveAttribute(
                'href',
                '/app/settings/contact-form/forms',
            )
        })

        it('renders voice channel info correctly', () => {
            const channel = createChannel('voice')
            renderWithRouter(<DrawerHeader channel={channel} />)
            expect(screen.getByText('Voice settings.')).toHaveAttribute(
                'href',
                '/app/settings/phone-numbers',
            )
        })

        it('renders sms channel info correctly', () => {
            const channel = createChannel('sms')
            renderWithRouter(<DrawerHeader channel={channel} />)
            expect(screen.getByText('SMS settings.')).toHaveAttribute(
                'href',
                '/app/settings/channels/sms',
            )
        })

        it('renders whatsApp channel info correctly', () => {
            const channel = createChannel('whatsApp')
            renderWithRouter(<DrawerHeader channel={channel} />)

            expect(screen.getByText('WhatsApp settings.')).toHaveAttribute(
                'href',
                '/app/settings/integrations/whatsapp',
            )
        })

        it('renders facebook channel info correctly', () => {
            const channel = createChannel('facebook')
            renderWithRouter(<DrawerHeader channel={channel} />)

            expect(
                screen.getByText('Facebook, Messenger & Instagram settings.'),
            ).toHaveAttribute('href', '/app/settings/integrations/facebook')
        })

        it('renders tiktokShop channel info correctly', () => {
            const channel = createChannel('tiktokShop')
            renderWithRouter(<DrawerHeader channel={channel} />)

            expect(screen.getByText('TikTok Shop settings.')).toHaveAttribute(
                'href',
                '/app/settings/integrations/app/653a626236234a4ec85eca67',
            )
        })
    })
})
