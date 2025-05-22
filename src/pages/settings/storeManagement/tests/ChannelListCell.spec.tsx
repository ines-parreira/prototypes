import React from 'react'

import { render, screen } from '@testing-library/react'

import { mockStoresWithAssignedChannels } from '../fixtures'
import ChannelListCell from '../storeManagementTable/StoreManagementTableRow/ChannelListCell'

describe('ChannelListCell', () => {
    const mockChannels = mockStoresWithAssignedChannels[0].assignedChannels

    const mockStoreId = 123

    it('renders channel icons correctly', () => {
        render(
            <ChannelListCell channels={mockChannels} storeId={mockStoreId} />,
        )

        expect(screen.getByText('email')).toBeInTheDocument()
        expect(screen.getByText('forum')).toBeInTheDocument()
        expect(
            document.querySelector('.icon-facebook-feed'),
        ).toBeInTheDocument()
        screen.debug(undefined, 100000)
    })

    it('handles empty channels array', () => {
        render(<ChannelListCell channels={[]} storeId={mockStoreId} />)

        const icons = screen.queryAllByRole('img', { hidden: true })
        expect(icons).toHaveLength(0)
    })
})
