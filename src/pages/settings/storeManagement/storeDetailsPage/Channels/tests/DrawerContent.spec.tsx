import React from 'react'

import { screen } from '@testing-library/react'

import { renderWithStore } from 'utils/testing'

import DrawerContent from '../ChannelsDrawer/DrawerContent'
import { Channel } from '../hooks/useChannels'

describe('ChannelsDrawerContent', () => {
    const mockActiveChannel: Channel = {
        title: 'Test Channel',
        description: 'Test Description',
        count: 2,
        type: 'email',
        assignedChannels: [
            {
                id: 1,
                name: 'Channel 1',
                type: 'email',
                meta: { address: 'test1@mail.com' },
            },
            {
                id: 2,
                name: 'Channel 2',
                type: 'email',
                meta: { address: 'test2@mail.com' },
            },
        ],
        unassignedChannels: [
            {
                id: 3,
                name: 'Channel 3',
                type: 'email',
                meta: { address: 'test3@mail.com' },
            },
        ],
    }

    const mockSetChanges = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the component with initial assigned channels', () => {
        renderWithStore(
            <DrawerContent
                activeChannel={mockActiveChannel}
                setChanges={mockSetChanges}
            />,
            {},
        )

        expect(
            screen.getByText(
                /Choose which support emails should be assigned to this store/,
            ),
        ).toBeInTheDocument()

        expect(screen.getByText(/Assign Test Channel/)).toBeInTheDocument()

        expect(screen.getByText('Channel 1')).toBeInTheDocument()
        expect(screen.getByText('Channel 2')).toBeInTheDocument()
    })

    it('initializes with assigned channel IDs from activeChannel', () => {
        renderWithStore(
            <DrawerContent
                activeChannel={mockActiveChannel}
                setChanges={mockSetChanges}
            />,
            {},
        )

        expect(screen.getByText('test1@mail.com')).toBeInTheDocument()
        expect(screen.getByText('test2@mail.com')).toBeInTheDocument()
        expect(screen.queryByText('test3@mail.com')).not.toBeInTheDocument()
    })
})
