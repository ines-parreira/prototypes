import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { MemoryRouter, Route } from 'react-router-dom'

import { useFlag } from 'core/flags'
import { assumeMock } from 'utils/testing'

import StoreDetailsPage from '../StoreDetailsPage'

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

describe('StoreDetailsPage', () => {
    const mockStoreId = '123'
    const initialRoute = `/app/settings/store-management/${mockStoreId}`

    const renderComponent = () => {
        const history = createMemoryHistory({ initialEntries: [initialRoute] })
        const renderResult = render(
            <MemoryRouter initialEntries={[initialRoute]}>
                <Route path="/app/settings/store-management/:id">
                    <StoreDetailsPage />
                </Route>
            </MemoryRouter>,
        )
        return { ...renderResult, history }
    }

    beforeEach(() => {
        useFlagMock.mockClear()
    })

    it('renders the component when MultiStore feature flag is enabled', () => {
        useFlagMock.mockImplementation(() => true)
        renderComponent()

        expect(screen.getByText('Store Details')).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: 'Channels' }),
        ).toBeInTheDocument()
    })

    it('does not render the component when MultiStore feature flag is disabled', () => {
        useFlagMock.mockImplementation(() => false)
        const { container } = renderComponent()

        expect(container.firstChild).toBeNull()
    })

    it('renders the correct navigation link with store ID', () => {
        useFlagMock.mockImplementation(() => true)
        renderComponent()

        const channelsLink = screen.getByRole('link', { name: 'Channels' })
        expect(channelsLink).toHaveAttribute(
            'href',
            `/app/settings/store-management/${mockStoreId}/channels`,
        )
    })

    it('redirects to channels tab by default', async () => {
        useFlagMock.mockImplementation(() => true)
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByText(
                    'View and manage your channels for this store.',
                ),
            ).toBeInTheDocument()
        })
    })
})
