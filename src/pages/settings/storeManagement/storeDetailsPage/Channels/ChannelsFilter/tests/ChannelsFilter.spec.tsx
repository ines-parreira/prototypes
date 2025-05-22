import { fireEvent, screen } from '@testing-library/react'

import { Integration } from 'models/integration/types'
import { renderWithStore } from 'utils/testing'

import { Channel } from '../../hooks/useChannels'
import * as filterOperations from '../../hooks/useFilterOperations'
import ChannelsFilter from '../ChannelsFilter'

describe('ChannelsFilter', () => {
    const mockSetAssignedChannelIds = jest.fn()
    const mockUpdateSelectedIntegrations = jest.fn()

    const activeChannel: Channel = {
        description: 'Test Channel Description',
        count: 3,
        type: 'email',
        title: 'Test Channel',
        unassignedChannels: [
            {
                id: 2,
                name: 'Email 2',
                type: 'email',
                meta: { address: 'email2@test.com' },
            },
            {
                id: 3,
                name: 'Email 3',
                type: 'email',
                meta: { address: 'email3@test.com' },
            },
        ] as Integration[],
        assignedChannels: [
            {
                id: 4,
                name: 'Email 4',
                type: 'email',
                meta: { address: 'email4@test.com' },
            },
        ] as Integration[],
    }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(filterOperations, 'useFilterOperations').mockReturnValue({
            selectedFilterItems: [],
            updateSelectedIntegrations: mockUpdateSelectedIntegrations,
            handleFilterClose: jest.fn(),
        })
    })

    it('renders SelectFilter with correct props', () => {
        renderWithStore(
            <ChannelsFilter
                activeChannel={activeChannel}
                assignedChannelIds={[]}
                setAssignedChannelIds={mockSetAssignedChannelIds}
            />,
            {},
        )
        expect(
            screen.getByText(`Assign ${activeChannel.title}`),
        ).toBeInTheDocument()
        expect(screen.getByText('Add New Email')).toBeInTheDocument()
    })

    it('filters out already assigned channels', () => {
        renderWithStore(
            <ChannelsFilter
                activeChannel={activeChannel}
                assignedChannelIds={[2]}
                setAssignedChannelIds={mockSetAssignedChannelIds}
            />,
            {},
        )
        expect(screen.queryByText('Email 2')).not.toBeInTheDocument()
        expect(screen.getByText('Email 3')).toBeInTheDocument()
        expect(screen.getByText('Email 4')).toBeInTheDocument()
    })

    it('renders nothing when activeChannel is not provided', () => {
        const { container } = renderWithStore(
            <ChannelsFilter
                activeChannel={undefined}
                assignedChannelIds={[]}
                setAssignedChannelIds={mockSetAssignedChannelIds}
            />,
            {},
        )
        expect(container.firstChild).toBeNull()
    })

    it('calls updateSelectedIntegrations when SelectFilter value changes', () => {
        renderWithStore(
            <ChannelsFilter
                activeChannel={activeChannel}
                assignedChannelIds={[]}
                setAssignedChannelIds={mockSetAssignedChannelIds}
            />,
            {},
        )

        const dropdownButton = screen
            .getByText(`Assign ${activeChannel.title}`)
            .closest('button')!
        fireEvent.click(dropdownButton)

        const checkbox2 = screen.getByLabelText('Email 2')

        fireEvent.click(checkbox2)

        expect(mockUpdateSelectedIntegrations).toHaveBeenCalledWith([2])
    })
})
