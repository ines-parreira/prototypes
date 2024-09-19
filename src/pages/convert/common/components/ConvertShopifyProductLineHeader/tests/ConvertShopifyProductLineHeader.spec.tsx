import {render, screen} from '@testing-library/react'
import React from 'react'
import {ConvertShopifyProductLineHeader} from '../ConvertShopifyProductLineHeader'

describe('ConvertShopifyProductLineHeader', () => {
    it('should render the header in a default state', () => {
        const productsCount = 10
        render(
            <ConvertShopifyProductLineHeader
                productsLength={productsCount}
                productsPerPage={productsCount + 1}
            />
        )

        expect(
            screen.getByText(`${productsCount} PRODUCTS`, {exact: false})
        ).toBeInTheDocument()
        expect(screen.queryByText('+')).not.toBeInTheDocument()
    })

    it('should render the header with next page indicator', () => {
        const productsCount = 10
        render(
            <ConvertShopifyProductLineHeader
                productsLength={productsCount}
                productsPerPage={productsCount}
            />
        )

        expect(
            screen.getByText(`${productsCount}+ PRODUCTS`, {exact: false})
        ).toBeInTheDocument()
    })
})
