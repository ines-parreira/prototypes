import type { ContextType } from 'react'

import { screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { DropdownContext } from 'pages/common/components/dropdown/Dropdown'
import { renderWithStore } from 'utils/testing'

import type { ChannelTypes, ChannelWithMetadata } from '../../../../types'
import UnselectableItems from '../UnselectableItems'

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

const mockContext: ContextType<typeof DropdownContext> = {
    isMultiple: false,
    value: null,
    query: '',
    onToggle: jest.fn(),
    getHighlightedLabel: jest.fn(),
    onQueryChange: jest.fn(),
}

const renderComponent = (activeChannel: ChannelWithMetadata, storeId = '1') => {
    return renderWithStore(
        <MemoryRouter initialEntries={[`/settings/stores/${storeId}`]}>
            <Route path="/settings/stores/:id">
                <DropdownContext.Provider value={mockContext}>
                    <UnselectableItems activeChannel={activeChannel} />
                </DropdownContext.Provider>
            </Route>
        </MemoryRouter>,
        {},
    )
}
const activeChannel = {
    title: 'Email Channel',
    description: 'Email Integration Channel',
    count: 0,
    type: 'email' as ChannelTypes,
    assignedChannels: [],
    unassignedChannels: [],
}
describe('UnselectableItems', () => {
    it('should display channels from other stores that match the active channel type', () => {
        renderComponent(activeChannel, '1')

        expect(
            screen.getByText('store2suppport@company.com'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Already used in another store'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('store1support@company.com'),
        ).not.toBeInTheDocument()
    })

    it('should display channel name when address is not available', () => {
        const storesWithNoAddress = [
            {
                store: { id: 2 },
                assignedChannels: [
                    {
                        id: 4,
                        name: 'No Address Email',
                        meta: {},
                        type: 'email',
                    },
                ],
            },
        ]

        jest.spyOn(
            require('../../../../StoreManagementProvider'),
            'useStoreManagementState',
        ).mockReturnValue({ stores: storesWithNoAddress })

        renderComponent(activeChannel, '1')

        expect(screen.getByText('No Address Email')).toBeInTheDocument()
    })
})
