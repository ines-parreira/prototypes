import React from 'react'

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import StoreManagementTableRow from '../storeManagementTable/StoreManagementTableRow/StoreManagementTableRow'
import { Store } from '../types'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: jest.fn(),
    }),
}))

describe('StoreManagementTableRow', () => {
    const mockStore: Store = {
        id: '1',
        name: 'Test Store',
        url: 'www.teststore.com',
        type: 'shopify',
        channels: [
            {
                type: 'email',
                name: 'email 1',
                id: '1',
                address: 'mail@email.com',
            },
            {
                type: 'chat',
                name: 'en-US',
                id: '2',
                address: 'chat english',
            },
        ],
    }

    const renderComponent = (store: Store = mockStore) => {
        return render(
            <MemoryRouter>
                <table>
                    <tbody>
                        <StoreManagementTableRow store={store} />
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

    it('renders channel icons', () => {
        renderComponent()

        const channelIcons = document.querySelectorAll('.channelIcon')
        expect(channelIcons.length).toBe(2)
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
