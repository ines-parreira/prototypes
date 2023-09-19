import React from 'react'
import {render} from '@testing-library/react'
import {PlanInterval, ProductType} from 'models/billing/types'
import {basicMonthlyHelpdeskPrice} from 'fixtures/productPrices'
import SummaryItem, {SummaryItemProps} from '../SummaryItem'

describe('SummaryItem', () => {
    const props: SummaryItemProps = {
        type: ProductType.Helpdesk,
        selectedPlans: {
            helpdesk: {
                isSelected: true,
                plan: basicMonthlyHelpdeskPrice,
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
            convert: {
                isSelected: false,
            },
        },
        interval: PlanInterval.Month,
        product: basicMonthlyHelpdeskPrice,
        prices: [
            basicMonthlyHelpdeskPrice,
            {
                ...basicMonthlyHelpdeskPrice,
                price_id: 'different_price_id',
                amount: 90000,
            },
        ],
    }

    it('returns null when selectedPlan.isSelected is false', () => {
        const {container} = render(
            <SummaryItem
                {...props}
                selectedPlans={{
                    helpdesk: {isSelected: false},
                    automation: {isSelected: false},
                    voice: {isSelected: false},
                    sms: {isSelected: false},
                    convert: {isSelected: false},
                }}
                product={undefined}
            />
        )
        expect(container.firstChild).toBeNull()
    })

    it('displays correct details when selectedPlan.isSelected is true', () => {
        const {getByText} = render(<SummaryItem {...props} />)
        expect(getByText('Helpdesk')).toBeInTheDocument()
        expect(getByText('Basic - 300 tickets/month')).toBeInTheDocument()
    })

    it('does not display old price when product.price_id matches selected plan', () => {
        const {queryByTestId} = render(
            <SummaryItem {...props} product={basicMonthlyHelpdeskPrice} />
        )
        expect(queryByTestId('oldPrice')).toBeNull()
    })

    it('displays old price when product.price_id does not match selected plan', () => {
        const {queryByTestId} = render(
            <SummaryItem
                {...props}
                product={{
                    ...basicMonthlyHelpdeskPrice,
                    price_id: 'different_price_id',
                }}
            />
        )
        expect(queryByTestId('oldPrice')).toBeInTheDocument() // Replace '50' with the expected old price you want to display
    })
})
