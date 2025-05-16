import React from 'react'

import { fireEvent, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { renderWithRouter, renderWithStore } from 'utils/testing'

import ChannelsTab from '../ChannelsTab'

describe('ChannelsTab', () => {
    it('renders the channels section with correct title and description', () => {
        renderWithRouter(<ChannelsTab />)

        expect(screen.getByText('Channels')).toBeInTheDocument()
        expect(
            screen.getByText('View and manage your channels for this store.'),
        ).toBeInTheDocument()
    })

    it('renders all channel types with correct counts', () => {
        renderWithRouter(<ChannelsTab />)

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

    describe('Channel drawer interactions', () => {
        it('opens drawer when clicking on a channel', async () => {
            renderWithStore(
                <MemoryRouter initialEntries={['/']}>
                    <ChannelsTab />
                </MemoryRouter>,
                {},
            )

            fireEvent.click(screen.getByText('Email'))

            expect(screen.getByText(/save changes/i)).toBeInTheDocument()
            expect(screen.getByText(/cancel/i)).toBeInTheDocument()
        })

        it('shows unconfirmed changes modal when closing with changes', async () => {
            renderWithStore(
                <MemoryRouter initialEntries={['/']}>
                    <ChannelsTab />
                </MemoryRouter>,
                {},
            )

            fireEvent.click(screen.getByText('3 Assigned'))
            screen.debug(undefined, 100000)
            fireEvent.click(screen.getAllByText(/close/i)[0])

            fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

            expect(
                screen.queryByText(
                    /Your changes to this page will be lost if you don’t save them./i,
                ),
            ).toBeInTheDocument()

            expect(
                screen.getByRole('button', { name: /discard/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /back to editing/i }),
            ).toBeInTheDocument()
        })

        it('closes drawer without modal when no changes made', () => {
            renderWithStore(
                <MemoryRouter initialEntries={['/']}>
                    <ChannelsTab />
                </MemoryRouter>,
                {},
            )

            fireEvent.click(screen.getByText('Email'))
            expect(
                screen.queryByText(
                    /Choose which support emails should be assigned to this store.*/,
                ),
            ).toBeInTheDocument()

            fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

            expect(
                screen.queryByText(
                    /Choose which support emails should be assigned to this store.*/,
                ),
            ).not.toBeInTheDocument()
        })

        it('saves changes and closes drawer when save button clicked', async () => {
            renderWithStore(
                <MemoryRouter initialEntries={['/']}>
                    <ChannelsTab />
                </MemoryRouter>,
                {},
            )

            fireEvent.click(screen.getByText('Email'))
            expect(
                screen.queryByText(
                    /Choose which support emails should be assigned to this store.*/,
                ),
            ).toBeInTheDocument()

            fireEvent.click(screen.getAllByText(/close/i)[0])

            const saveButton = screen.getByRole('button', {
                name: /save changes/i,
            })
            expect(saveButton).toBeEnabled()

            fireEvent.click(saveButton)

            expect(
                screen.queryByText(
                    /Choose which support emails should be assigned to this store.*/,
                ),
            ).not.toBeInTheDocument()
        })
    })
})
