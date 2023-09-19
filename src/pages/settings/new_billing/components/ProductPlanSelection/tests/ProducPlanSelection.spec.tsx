import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import {PlanInterval, ProductType} from 'models/billing/types'
import {basicMonthlyHelpdeskPrice} from 'fixtures/productPrices'
import ProductPlanSelection, {
    ProductPlanSelectionProps,
} from '../ProductPlanSelection'

describe('ProductPlanSelection', () => {
    const mockSetSelectedPlans = jest.fn()

    const selectedPlans = {
        helpdesk: {
            plan: basicMonthlyHelpdeskPrice,
            isSelected: true,
        },
        automation: {
            isSelected: false,
        },
        voice: {
            isSelected: false,
        },
        sms: {
            isSelected: false,
        },
    }

    const props: ProductPlanSelectionProps = {
        type: ProductType.Helpdesk,
        interval: PlanInterval.Month,
        product: basicMonthlyHelpdeskPrice,
        prices: [
            basicMonthlyHelpdeskPrice,
            {
                ...basicMonthlyHelpdeskPrice,
                price_id: 'price_123',
                name: 'Product 1',
                num_quota_tickets: 100,
            },
            {
                ...basicMonthlyHelpdeskPrice,
                price_id: 'price_456',
                name: 'Product 2',
                num_quota_tickets: 200,
            },
        ],
        selectedPlans,
        setSelectedPlans: mockSetSelectedPlans,
        isStarterHelpdeskPlanSelected: false,
    }

    it('displays the product type title', () => {
        const {getByText} = render(<ProductPlanSelection {...props} />)
        expect(getByText('Helpdesk')).toBeInTheDocument()
    })

    it('displays the active badge when product is active', () => {
        const {getByText} = render(<ProductPlanSelection {...props} />)
        expect(getByText('Active')).toBeInTheDocument()
    })

    it('displays the add product button when product is not active', () => {
        const {getByText} = render(
            <ProductPlanSelection
                {...props}
                product={undefined}
                selectedPlans={{
                    ...selectedPlans,
                    [ProductType.Helpdesk]: {isSelected: false},
                }}
            />
        )
        expect(getByText('Add Product')).toBeInTheDocument()
    })

    it('calls handleClose when the close button is clicked', () => {
        const {getByText} = render(
            <ProductPlanSelection {...props} product={undefined} />
        )
        const closeButton = getByText('close')
        fireEvent.click(closeButton)
        expect(mockSetSelectedPlans).toHaveBeenCalled()
    })

    it('calls handleOpen when the add product button is clicked', () => {
        const {getByText} = render(
            <ProductPlanSelection
                {...props}
                product={undefined}
                selectedPlans={{
                    ...selectedPlans,
                    [ProductType.Helpdesk]: {isSelected: false},
                }}
            />
        )
        const addProductButton = getByText('Add Product')
        fireEvent.click(addProductButton)
        expect(mockSetSelectedPlans).toHaveBeenCalled()
    })
})
