import { screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { IntegrationType } from 'models/integration/constants'
import type { Integration } from 'models/integration/types'
import { renderWithStore } from 'utils/testing'

import type { ChannelWithMetadata } from '../../../types'
import DrawerContent from '../ChannelsDrawer/DrawerContent'

describe('ChannelsDrawerContent', () => {
    const mockActiveChannel: ChannelWithMetadata = {
        title: 'Test Channel',
        description: 'Test Description',
        count: 2,
        type: 'email',
        assignedChannels: [
            {
                id: 1,
                name: 'Channel 1',
                type: IntegrationType.Email,
                meta: { address: 'test1@mail.com' },
            },
            {
                id: 2,
                name: 'Channel 2',
                type: IntegrationType.Email,
                meta: { address: 'test2@mail.com' },
            },
        ] as Integration[],
        unassignedChannels: [
            {
                id: 3,
                name: 'Channel 3',
                type: 'email',
                meta: { address: 'test3@mail.com' },
            },
        ] as Integration[],
    }

    const mockSetChanges = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the component with initial assigned channels', () => {
        renderWithStore(
            <MemoryRouter>
                <DrawerContent
                    activeChannel={mockActiveChannel}
                    setChanges={mockSetChanges}
                />
            </MemoryRouter>,
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
            <MemoryRouter>
                {' '}
                <DrawerContent
                    activeChannel={mockActiveChannel}
                    setChanges={mockSetChanges}
                />
            </MemoryRouter>,
            {},
        )

        expect(screen.getByText('test1@mail.com')).toBeInTheDocument()
        expect(screen.getByText('test2@mail.com')).toBeInTheDocument()
        expect(screen.queryByText('test3@mail.com')).not.toBeInTheDocument()
    })

    it('handles activeChannel with no assignedChannels gracefully', () => {
        const mockActiveChannelWithoutAssigned: ChannelWithMetadata = {
            ...mockActiveChannel,
            assignedChannels: [],
            unassignedChannels: [],
        }

        renderWithStore(
            <MemoryRouter>
                {' '}
                <DrawerContent
                    activeChannel={mockActiveChannelWithoutAssigned}
                    setChanges={mockSetChanges}
                />
            </MemoryRouter>,
            {},
        )

        expect(screen.getByText(/Assign Test Channel/)).toBeInTheDocument()
    })
})
