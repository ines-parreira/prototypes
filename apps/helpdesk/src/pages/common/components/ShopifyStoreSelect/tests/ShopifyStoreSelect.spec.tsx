import React from 'react'

import { render, screen } from '@testing-library/react'

import '@testing-library/jest-dom/extend-expect'

import { fromJS } from 'immutable'

import { FormState } from '../../infobar/Infobar/InfobarCustomerInfo/CustomerSyncForm/useCustomerSyncForm'
import { getDefaultStore } from '../helpers'
import ShopifyStoreSelect from '../ShopifyStoreSelect'

jest.mock('@gorgias/helpdesk-queries', () => ({
    useListCustomerIntegrationsWithChannelDefault: jest.fn(),
}))

jest.mock('../helpers', () => ({
    getDefaultStore: jest.fn(),
}))

describe('ShopifyStoreSelect', () => {
    const mockOnChange = jest.fn()
    const mockFormState = { store: '' } as unknown as FormState

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders without crashing', () => {
        const mockShopifyStores = fromJS([])
        render(
            <ShopifyStoreSelect
                hasError={false}
                onChange={mockOnChange}
                formState={mockFormState}
                shopifyStores={mockShopifyStores}
            />,
        )

        expect(screen.getByText('Shopify store')).toBeInTheDocument()
    })

    it('displays error message when hasError is true', () => {
        const mockShopifyStores = fromJS([])
        render(
            <ShopifyStoreSelect
                hasError={true}
                onChange={mockOnChange}
                formState={mockFormState}
                shopifyStores={mockShopifyStores}
            />,
        )

        expect(
            screen.getByText('Please select shopify store'),
        ).toBeInTheDocument()
    })

    it('calls onChange with default store when shopifyStores is available', () => {
        const mockShopifyStores = fromJS([{ id: 'store1' }])
        ;(getDefaultStore as jest.Mock).mockReturnValue('store1')

        render(
            <ShopifyStoreSelect
                hasError={false}
                onChange={mockOnChange}
                formState={mockFormState}
                shopifyStores={mockShopifyStores}
            />,
        )

        expect(mockOnChange).toHaveBeenCalledWith({ store: 'store1' })
    })
})
