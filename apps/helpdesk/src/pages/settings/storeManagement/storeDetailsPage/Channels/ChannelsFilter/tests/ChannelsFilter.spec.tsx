import { screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { Integration } from 'models/integration/types'
import { renderWithStore } from 'utils/testing'

import { ChannelWithMetadata } from '../../../../types'
import ChannelsFilter from '../ChannelsFilter'

const mockStores = [
    {
        store: { id: 1 },
        assignedChannels: [
            {
                id: 1,
                name: 'Support Email',
                meta: { address: 'store1support@company.com' },
                type: 'email',
            },
            {
                id: 2,
                name: 'Sales Email',
                meta: { address: 'store1sales@company.com' },
                type: 'email',
            },
        ],
    },
    {
        store: { id: 2 },
        assignedChannels: [
            {
                id: 3,
                name: 'Support Email',
                meta: { address: 'store2suppport@company.com' },
                type: 'email',
            },
        ],
    },
]

jest.mock('../../../../StoreManagementProvider', () => ({
    useStoreManagementState: () => ({
        stores: mockStores,
    }),
}))

describe('ChannelsFilter', () => {
    const mockSetAssignedChannelIds = jest.fn()

    const activeChannel: ChannelWithMetadata = {
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
    })

    it('renders SelectFilter with correct props', () => {
        renderWithStore(
            <ChannelsFilter
                selectorLabel="Assign Test Channel"
                activeChannel={activeChannel}
                assignedChannelIds={[]}
                setAssignedChannelIds={mockSetAssignedChannelIds}
            />,
            {},
        )
        expect(
            screen.getByText(`Assign ${activeChannel.title}`),
        ).toBeInTheDocument()
    })

    it('filters out already assigned channels', async () => {
        renderWithStore(
            <MemoryRouter initialEntries={[`/settings/stores/1}`]}>
                <Route path="/settings/stores/:id">
                    <ChannelsFilter
                        selectorLabel="Assign Test Channel"
                        activeChannel={activeChannel}
                        assignedChannelIds={[2]}
                        setAssignedChannelIds={mockSetAssignedChannelIds}
                    />
                    ,
                </Route>
            </MemoryRouter>,
            {},
        )

        const button = screen.getByText(`Assign ${activeChannel.title}`)
        button.click()

        await waitFor(() => {
            expect(
                screen.queryByText('email2@test.com'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('store2suppport@company.com'),
            ).toBeInTheDocument()
            expect(screen.getByText('email3@test.com')).toBeInTheDocument()
            expect(screen.getByText('email4@test.com')).toBeInTheDocument()
        })
    })

    it('renders nothing when activeChannel is not provided', () => {
        const { container } = renderWithStore(
            <ChannelsFilter
                selectorLabel="Assign Test Channel"
                activeChannel={undefined}
                assignedChannelIds={[]}
                setAssignedChannelIds={mockSetAssignedChannelIds}
            />,
            {},
        )
        expect(container.firstChild).toBeNull()
    })
})
