import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { useFlag } from 'core/flags'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { ShopifyContext } from 'Widgets/modules/Shopify/contexts/ShopifyContext'

import CustomerMetafieldsSection from '../CustomerMetafieldsSection'

jest.mock('core/flags')
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

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlag.mockReturnValue(true)
    })

    const renderComponent = (isEditing: boolean) => {
        return render(
            <ShopifyContext.Provider value={mockShopifyContextValue}>
                <IntegrationContext.Provider
                    value={mockIntegrationContextValue}
                >
                    <CustomerMetafieldsSection isEditing={isEditing} />
                </IntegrationContext.Provider>
            </ShopifyContext.Provider>,
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
