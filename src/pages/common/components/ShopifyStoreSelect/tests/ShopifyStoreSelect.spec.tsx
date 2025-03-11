import React from 'react'

import { render, screen } from '@testing-library/react'

import '@testing-library/jest-dom/extend-expect'

import { fromJS, Map } from 'immutable'

import { useListCustomerIntegrationsWithChannelDefault } from '@gorgias/api-queries'

import { FormState } from '../../infobar/Infobar/InfobarCustomerInfo/CustomerSyncForm/useCustomerSyncForm'
import { getDefaultStore } from '../helpers'
import ShopifyStoreSelect from '../ShopifyStoreSelect'

jest.mock('@gorgias/api-queries', () => ({
    useListCustomerIntegrationsWithChannelDefault: jest.fn(),
}))

jest.mock('../helpers', () => ({
    getDefaultStore: jest.fn(),
}))

describe('ShopifyStoreSelect', () => {
    const mockOnChange = jest.fn()
    const mockActiveCustomer = Map({ id: '123' })
    const mockFormState = { store: '' } as unknown as FormState

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders without crashing', () => {
        ;(
            useListCustomerIntegrationsWithChannelDefault as jest.Mock
        ).mockReturnValue({
            data: fromJS([]),
        })

        render(
            <ShopifyStoreSelect
                hasError={false}
                onChange={mockOnChange}
                formState={mockFormState}
                activeCustomer={mockActiveCustomer}
            />,
        )

        expect(screen.getByText('Shopify store')).toBeInTheDocument()
    })

    it('displays error message when hasError is true', () => {
        ;(
            useListCustomerIntegrationsWithChannelDefault as jest.Mock
        ).mockReturnValue({
            data: fromJS([]),
        })

        render(
            <ShopifyStoreSelect
                hasError={true}
                onChange={mockOnChange}
                formState={mockFormState}
                activeCustomer={mockActiveCustomer}
            />,
        )

        expect(
            screen.getByText('Please select shopify store.'),
        ).toBeInTheDocument()
    })

    it('calls onChange with default store when shopifyStores is available', () => {
        const mockShopifyStores = fromJS([{ id: 'store1' }])
        ;(
            useListCustomerIntegrationsWithChannelDefault as jest.Mock
        ).mockReturnValue({
            data: mockShopifyStores,
        })
        ;(getDefaultStore as jest.Mock).mockReturnValue('store1')

        render(
            <ShopifyStoreSelect
                hasError={false}
                onChange={mockOnChange}
                formState={mockFormState}
                activeCustomer={mockActiveCustomer}
            />,
        )

        expect(mockOnChange).toHaveBeenCalledWith({ store: 'store1' })
    })
})
