import React from 'react'

import { useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { ShopifyContext } from 'Widgets/modules/Shopify/contexts/ShopifyContext'

import CustomerMetafieldsSection from '../CustomerMetafieldsSection'

jest.mock('@repo/feature-flags')
const mockUseFlag = assumeMock(useFlag)

describe('<CustomerMetafieldsSection />', () => {
    const mockShopifyContextValue = {
        data_source: 'Customer' as const,
        widget_resource_ids: {
            target_id: 123,
            customer_id: null,
        },
    }

    const mockIntegrationContextValue = {
        integration: fromJS({}),
        integrationId: 456,
        meta: {
            store_url: 'example.example.com',
            admin_url_suffix: '',
        },
    }

    let queryClient: QueryClient

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        })
        jest.clearAllMocks()
        mockUseFlag.mockReturnValue(true)
    })

    afterEach(() => {
        queryClient.clear()
    })

    const renderComponent = (isEditing: boolean) => {
        return render(
            <QueryClientProvider client={queryClient}>
                <ShopifyContext.Provider value={mockShopifyContextValue}>
                    <IntegrationContext.Provider
                        value={mockIntegrationContextValue}
                    >
                        <CustomerMetafieldsSection isEditing={isEditing} />
                    </IntegrationContext.Provider>
                </ShopifyContext.Provider>
            </QueryClientProvider>,
        )
    }

    describe('when isEditing is false', () => {
        it('should render WrappedCustomerMetafields', () => {
            renderComponent(false)

            expect(screen.getByText('Customer Metafields')).toBeInTheDocument()
        })
    })

    describe('when isEditing is true', () => {
        it('should render null', () => {
            const { container } = renderComponent(true)

            expect(container.firstChild).toBeNull()
        })
    })
})
