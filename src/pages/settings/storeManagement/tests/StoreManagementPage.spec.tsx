import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

import { useFlag } from 'core/flags'
import { assumeMock } from 'utils/testing'

import StoreManagementPage from '../storeManagementPage/StoreManagementPage'
import { StoreManagementProvider } from '../StoreManagementProvider'

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                cacheTime: 0,
                staleTime: 0,
            },
        },
    })

describe('StoreManagement', () => {
    afterEach(() => {
        useFlagMock.mockClear()
    })
    it('renders the component when the MultiStore feature flag is enabled', () => {
        useFlagMock.mockImplementation(() => true)
        const testQueryClient = createTestQueryClient()

        render(
            <QueryClientProvider client={testQueryClient}>
                <StoreManagementProvider>
                    <StoreManagementPage />
                </StoreManagementProvider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('Store Management')).toBeInTheDocument()
    })

    it('does not render the component when the MultiStore feature flag is disabled', () => {
        useFlagMock.mockImplementation(() => false)
        const testQueryClient = createTestQueryClient()

        const { container } = render(
            <QueryClientProvider client={testQueryClient}>
                <StoreManagementProvider>
                    <StoreManagementPage />
                </StoreManagementProvider>
            </QueryClientProvider>,
        )

        expect(container.firstChild).toBeNull()
    })
})
