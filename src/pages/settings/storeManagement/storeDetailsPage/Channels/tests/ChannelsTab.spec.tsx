import React, { ReactNode } from 'react'

import { fireEvent, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useFlag } from 'core/flags'
import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { assumeMock, renderWithStore } from 'utils/testing'

import { mockStoresWithAssignedChannels } from '../../../fixtures'
import { StoreManagementProvider } from '../../../StoreManagementProvider'
import ChannelsTab from '../ChannelsTab'

jest.mock('core/flags')

const mockUseFlag = assumeMock(useFlag)

const mockChannel = {
    title: 'Email',
    type: 'email',
    count: 3,
    assignedChannels: [
        {
            id: 1,
            type: 'email',
            name: 'test-email 1',
            uri: 'address1',
            meta: {
                address: 'test@test-1.com',
            },
        },
        {
            id: 2,
            type: 'email',
            name: 'test-email 2',
            uri: 'address 2',
            meta: {
                address: 'test@test-2.com',
            },
        },
        {
            id: 3,
            type: 'email',
            name: 'test-email 3',
            uri: 'address3',
            meta: {
                address: 'test@test-3.com',
            },
        },
    ],
    unassignedChannels: [
        {
            id: 4,
            type: 'email',
            name: 'test-email 4',
            uri: 'address4',
            meta: {
                address: 'test@test-4.com',
            },
        },
    ],
}

jest.mock('../hooks/useChannels', () => {
    return {
        useChannels: () => [
            mockChannel,
            {
                title: 'Chat',
                description: '',
                count: 0,
                type: 'chat',
                assignedChannels: [],
                unassignedChannels: [],
            },
            {
                title: 'Help Center',
                description: '',
                count: 0,
                type: 'helpCenter',
                assignedChannels: [],
                unassignedChannels: [],
            },
            {
                title: 'Contact Form',
                description: '',
                count: 0,
                type: 'contactForm',
                assignedChannels: [],
                unassignedChannels: [],
            },
            {
                title: 'WhatsApp',
                description: '',
                count: 0,
                type: 'whatsApp',
                assignedChannels: [],
                unassignedChannels: [],
            },
            {
                title: 'Facebook, Messenger & Instagram',
                description: '',
                count: 0,
                type: 'facebook',
                assignedChannels: [],
                unassignedChannels: [],
            },
        ],
    }
})

const mockCreateMapping = jest.fn().mockResolvedValue({ success: true })
const mockDeleteMapping = jest.fn().mockResolvedValue({ success: true })
const mockRefetchMapping = jest.fn()

jest.mock('models/storeMapping/queries', () => ({
    useCreateStoreMapping: () => ({
        mutateAsync: mockCreateMapping,
        isLoading: false,
    }),
    useDeleteStoreMapping: () => ({
        mutateAsync: mockDeleteMapping,
        isLoading: false,
    }),
}))

const mockHandleMappingResults = jest.fn()
jest.mock('../hooks/useNotifications', () => ({
    useNotifications: () => ({
        handleMappingResults: mockHandleMappingResults,
    }),
}))

jest.mock('../../../StoreManagementProvider', () => ({
    useStoreManagementState: () => ({
        stores: mockStoresWithAssignedChannels,
        unassignedChannels: [],
        refetchMapping: mockRefetchMapping,
    }),
    StoreManagementProvider: ({ children }: { children: ReactNode }) => (
        <div>{children}</div>
    ),
}))

describe('ChannelsTab', () => {
    const storeId = '1'
    const { QueryClientProvider } = mockQueryClientProvider()

    beforeAll(() => {
        mockUseFlag.mockReturnValue([
            'email',
            'chat',
            'helpCenter',
            'contactForm',
            'whatsApp',
            'facebook',
        ])
    })

    const renderComponent = () => {
        return renderWithStore(
            <MemoryRouter initialEntries={['/']}>
                <QueryClientProvider>
                    <StoreManagementProvider>
                        <ChannelsTab storeId={storeId} />
                    </StoreManagementProvider>
                </QueryClientProvider>
            </MemoryRouter>,
            {},
        )
    }

    it('renders the channels section with correct title and description', () => {
        renderComponent()

        expect(screen.getByText('Channels')).toBeInTheDocument()
        expect(
            screen.getByText('View and manage your channels for this store.'),
        ).toBeInTheDocument()
    })

    it('renders all channel types with correct counts', () => {
        renderComponent()

        expect(
            screen.getByTestId('settings-feature-row-email'),
        ).toBeInTheDocument()
    })

    describe('Channel drawer interactions', () => {
        it('opens drawer when clicking on a channel', async () => {
            renderComponent()

            const emailRow = screen.getByTestId('settings-feature-row-email')
            fireEvent.click(emailRow)

            expect(
                screen.getByRole('button', { name: /save changes/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /cancel/i }),
            ).toBeInTheDocument()
        })

        it('shows unconfirmed changes modal when closing with changes', async () => {
            renderComponent()

            const emailRow = screen.getByTestId('settings-feature-row-email')
            fireEvent.click(emailRow)

            fireEvent.click(screen.getAllByText(/delete/i)[0])

            fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

            expect(
                screen.getByRole('button', { name: /discard/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /back to editing/i }),
            ).toBeInTheDocument()
        })

        it('closes drawer without modal when no changes made', () => {
            renderComponent()

            fireEvent.click(screen.getByTestId('settings-feature-row-email'))

            const assignEmailButton = screen.getByRole('button', {
                name: /assign email/i,
            })
            fireEvent.click(assignEmailButton)

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
            renderComponent()

            fireEvent.click(screen.getByTestId('settings-feature-row-email'))

            expect(
                screen.queryByText(
                    /Choose which support emails should be assigned to this store.*/,
                ),
            ).toBeInTheDocument()

            fireEvent.click(screen.getAllByText(/delete/i)[0])

            const saveButton = screen.getByRole('button', {
                name: /save changes/i,
            })
            expect(saveButton).toBeEnabled()

            fireEvent.click(saveButton)

            await waitFor(() => {
                expect(
                    screen.queryByText(
                        /Choose which support emails should be assigned to this store.*/,
                    ),
                ).not.toBeInTheDocument()
            })
        })

        it('creates new channel mapping when adding a channel', async () => {
            renderComponent()

            fireEvent.click(screen.getByTestId('settings-feature-row-email'))

            const assignEmailButton = screen.getByRole('button', {
                name: /assign email/i,
            })
            fireEvent.click(assignEmailButton)

            const emailToAssign = screen.getByText('test@test-4.com')
            fireEvent.click(emailToAssign)

            const saveButton = screen.getByRole('button', {
                name: /save changes/i,
            })
            expect(saveButton).toBeEnabled()
            fireEvent.click(assignEmailButton)

            fireEvent.click(saveButton)

            await waitFor(() => {
                expect(mockCreateMapping).toHaveBeenCalledWith([
                    {
                        store_id: 1,
                        integration_id: 4,
                    },
                ])
            })
        })
    })

    it('should handle errors during mapping operations', async () => {
        mockDeleteMapping.mockRejectedValueOnce(
            new Error('Failed to create mapping'),
        )

        renderComponent()

        fireEvent.click(screen.getByTestId('settings-feature-row-email'))

        expect(
            screen.queryByText(
                /Choose which support emails should be assigned to this store.*/,
            ),
        ).toBeInTheDocument()

        fireEvent.click(screen.getAllByText(/delete/i)[0])

        const saveButton = screen.getByRole('button', {
            name: /save changes/i,
        })
        expect(saveButton).toBeEnabled()

        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(mockHandleMappingResults).toHaveBeenCalledWith(
                [{ channelId: 1 }],
                [{ channelId: 1, action: 'remove' }],
            )
            expect(mockRefetchMapping).toHaveBeenCalled()
        })
    })

    it('should respect the included channels flag', () => {
        mockUseFlag.mockReturnValue(['email', 'chat'])
        renderComponent()

        expect(
            screen.getByTestId('settings-feature-row-email'),
        ).toBeInTheDocument()
        expect(
            screen.queryByTestId('settings-feature-row-chat'),
        ).toBeInTheDocument()
        expect(
            screen.queryByTestId('settings-feature-row-helpCenter'),
        ).not.toBeInTheDocument()
    })
})
