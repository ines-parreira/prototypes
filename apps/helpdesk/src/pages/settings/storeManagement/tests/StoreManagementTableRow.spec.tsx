import React from 'react'

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { IntegrationType } from 'models/integration/constants'
import { Integration } from 'models/integration/types'

import StoreManagementTableRow from '../storeManagementTable/StoreManagementTableRow/StoreManagementTableRow'
import { StoreWithAssignedChannels } from '../types'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: jest.fn(),
    }),
}))

describe('StoreManagementTableRow', () => {
    const mockStore = {
        store: {
            id: 1,
            name: 'Test Store',
            type: IntegrationType.Shopify,
            uri: 'https://test-store.myshopify.com',
            user: {
                id: 1,
            },
            managed: false,
            meta: {
                shop_name: 'Test Store',
                shop_domain: 'www.teststore.com',
                shop_id: 123,
                webhooks: [],
            },
        },
        assignedChannels: [
            {
                id: 1,
                name: 'email 1',
                type: 'email',
                uri: 'mailto:mail@email.com',
                user: {
                    id: 1,
                },
                managed: false,
                meta: {
                    address: 'mail@email.com',
                },
            },
            {
                id: 2,
                name: 'en-US',
                type: 'chat',
                uri: 'chat:english',
                user: {
                    id: 1,
                },
                managed: false,
                meta: {
                    address: 'chat english',
                },
            },
        ] as Integration[],
    }

    const renderComponent = () => {
        return render(
            <MemoryRouter>
                <table>
                    <tbody>
                        <StoreManagementTableRow
                            store={
                                mockStore as unknown as StoreWithAssignedChannels
                            }
                        />
                    </tbody>
                </table>
            </MemoryRouter>,
        )
    }

    it('renders store name with logo', () => {
        renderComponent()

        const storeNameElement = screen.getByText('Test Store')
        expect(storeNameElement).toBeInTheDocument()

        const logo = screen.getByAltText('logo')
        expect(logo).toBeInTheDocument()
        expect(logo).toHaveAttribute('src')
    })

    it('renders store URL', () => {
        renderComponent()

        const storeUrl = screen.getByText('www.teststore.com')
        expect(storeUrl).toBeInTheDocument()
    })

    it('renders navigation icon', () => {
        renderComponent()

        const navIcon = screen.getByText('chevron_right')
        expect(navIcon).toBeInTheDocument()
        expect(navIcon).toHaveClass('material-icons')
    })

    it('navigates to the correct URL when the row is clicked', () => {
        const mockPush = jest.fn()
        jest.spyOn(require('react-router-dom'), 'useHistory').mockReturnValue({
            push: mockPush,
        })

        renderComponent()

        const row = screen.getByRole('row')
        row.click()

        expect(mockPush).toHaveBeenCalledWith(
            '/app/settings/store-management/1',
        )
    })
})
