import React from 'react'

import { render, screen } from '@testing-library/react'

import { IntegrationType } from '../../../../models/integration/constants'
import type { Integration } from '../../../../models/integration/types'
import { mockStoresWithAssignedChannels } from '../fixtures'
import ChannelListCell from '../storeManagementTable/StoreManagementTableRow/ChannelListCell'

describe('ChannelListCell', () => {
    const mockChannels = mockStoresWithAssignedChannels[0].assignedChannels

    const mockStoreId = 123

    it('renders channel icons correctly', () => {
        render(
            <ChannelListCell channels={mockChannels} storeId={mockStoreId} />,
        )

        expect(screen.getByAltText('email')).toBeInTheDocument()
        expect(screen.getByAltText('gorgias_chat')).toBeInTheDocument()
        expect(screen.getByAltText('facebook')).toBeInTheDocument()
    })

    it('handles empty channels array', () => {
        render(<ChannelListCell channels={[]} storeId={mockStoreId} />)

        const icons = screen.queryAllByRole('img', { hidden: true })
        expect(icons).toHaveLength(0)
    })
    it('handles tiktok icon', () => {
        render(
            <ChannelListCell
                channels={
                    [
                        {
                            type: IntegrationType.App,
                            application_id: '653a626236234a4ec85eca67',
                            meta: {},
                        },
                    ] as Integration[]
                }
                storeId={mockStoreId}
            />,
        )

        expect(screen.getByAltText('tiktok-shop')).toBeInTheDocument()
    })
})
