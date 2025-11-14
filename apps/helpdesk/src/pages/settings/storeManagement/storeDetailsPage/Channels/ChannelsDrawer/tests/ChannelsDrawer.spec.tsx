import React from 'react'

import { fireEvent, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { renderWithStore } from 'utils/testing'

import { ChannelChange, ChannelWithMetadata } from '../../../../types'
import ChannelsDrawer from '../ChannelsDrawer'

const mockChannel: ChannelWithMetadata = {
    title: 'Test Channel',
    description: 'Test Description',
    count: 1,
    type: 'email',
    assignedChannels: [],
    unassignedChannels: [],
}

const defaultProps = {
    isLoading: false,
    activeChannel: mockChannel,
    changes: [] as ChannelChange[],
    onCloseDrawer: jest.fn(),
    onSaveDrawer: jest.fn(),
    setChanges: jest.fn(),
}

describe('ChannelsDrawer', () => {
    it('renders nothing when activeChannel is not provided', () => {
        const { container } = renderWithStore(
            <MemoryRouter>
                <ChannelsDrawer {...defaultProps} activeChannel={null as any} />
            </MemoryRouter>,
            {},
        )
        expect(container.firstChild).toBeNull()
    })

    it('renders drawer with channel title', () => {
        renderWithStore(
            <MemoryRouter>
                <ChannelsDrawer {...defaultProps} />
            </MemoryRouter>,
            {},
        )
        expect(screen.getByText('Test Channel')).toBeInTheDocument()
    })

    it('calls onCloseDrawer when Cancel button is clicked', () => {
        renderWithStore(
            <MemoryRouter>
                <ChannelsDrawer {...defaultProps} />
            </MemoryRouter>,
            {},
        )
        fireEvent.click(screen.getByText('Cancel'))
        expect(defaultProps.onCloseDrawer).toHaveBeenCalled()
    })

    it('disables Save Changes button when no changes exist', () => {
        renderWithStore(
            <MemoryRouter>
                <ChannelsDrawer {...defaultProps} />
            </MemoryRouter>,
            {},
        )
        const saveButton = screen.getByRole('button', { name: 'Save Changes' })
        expect(saveButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('enables Save Changes button when changes exist', () => {
        renderWithStore(
            <MemoryRouter>
                <ChannelsDrawer
                    {...defaultProps}
                    changes={[{ channelId: 1, action: 'add' }]}
                />
            </MemoryRouter>,
            {},
        )
        expect(screen.getByText('Save Changes')).toBeEnabled()
    })
})
