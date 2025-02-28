import React from 'react'

import { screen } from '@testing-library/react'

import { useListTrackstarConnections } from 'models/workflows/queries'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import StoreTrackstarContext from '../StoreTrackstarContext'
import StoreTrackstarProvider from '../StoreTrackstarProvider'

jest.mock('models/workflows/queries')

const mockUseListTrackstarConnections = jest.mocked(useListTrackstarConnections)

mockUseListTrackstarConnections.mockReturnValue({
    data: [],
    isInitialLoading: false,
} as unknown as ReturnType<typeof useListTrackstarConnections>)

describe('<StoreTrackstarProvider />', () => {
    it('should use trackstar integration id from store app', () => {
        mockUseListTrackstarConnections.mockReturnValue({
            data: {
                sandbox: {
                    connection_id: 'sandbox_connection_id',
                    store_name: 'acme',
                    store_type: 'shopify',
                    account_id: 1,
                    integration_name: 'sandbox',
                    error: false,
                },
            },
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useListTrackstarConnections>)

        renderWithQueryClientProvider(
            <StoreTrackstarProvider storeName="acme" storeType="shopify">
                <StoreTrackstarContext.Consumer>
                    {(contextValue) => {
                        return `Trackstar integration: ${contextValue.connections.sandbox?.connection_id}`
                    }}
                </StoreTrackstarContext.Consumer>
            </StoreTrackstarProvider>,
        )

        expect(
            screen.getByText('Trackstar integration: sandbox_connection_id'),
        ).toBeInTheDocument()
    })
})
