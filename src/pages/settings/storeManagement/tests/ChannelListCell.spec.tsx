import React from 'react'

import { render, screen } from '@testing-library/react'

import ChannelListCell from '../storeManagementTable/StoreManagementTableRow/ChannelListCell'
import { Channel } from '../types'

describe('ChannelListCell', () => {
    const mockChannels: Channel[] = [
        { type: 'email', name: 'email 1', id: '1', address: 'email@email.com' },
        { type: 'chat', name: 'chat', id: '2', address: 'en-US' },
    ]

    const mockStoreId = 'store-123'

    it('renders channel icons correctly', () => {
        render(
            <ChannelListCell channels={mockChannels} storeId={mockStoreId} />,
        )

        expect(screen.getByText('email')).toBeInTheDocument()
        expect(screen.getByText('forum')).toBeInTheDocument()
    })

    it('handles empty channels array', () => {
        render(<ChannelListCell channels={[]} storeId={mockStoreId} />)

        const icons = screen.queryAllByRole('img', { hidden: true })
        expect(icons).toHaveLength(0)
    })
})
