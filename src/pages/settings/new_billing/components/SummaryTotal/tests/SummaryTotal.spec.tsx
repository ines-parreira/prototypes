import React from 'react'
import {render} from '@testing-library/react'
import {
    basicMonthlyAutomationPrice,
    basicMonthlyHelpdeskPrice,
} from 'fixtures/productPrices'
import {SelectedPlans} from 'pages/settings/new_billing/views/BillingProcessView/BillingProcessView'
import {PlanInterval} from 'models/billing/types'
import SummaryTotal from '../SummaryTotal'

const selectedPlans: SelectedPlans = {
    helpdesk: {
        isSelected: true,
        plan: basicMonthlyHelpdeskPrice,
    },
    automation: {
        isSelected: true,
        plan: basicMonthlyAutomationPrice,
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
}
const totalProductAmount =
    basicMonthlyHelpdeskPrice.amount + basicMonthlyAutomationPrice.amount
const totalProductAmountDifferent = totalProductAmount + 10000
const interval = PlanInterval.Month
const currency = 'USD'

describe('SummaryTotal', () => {
    it('should render total price without old price', () => {
        const {queryByTestId} = render(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                interval={interval}
                currency={currency}
            />
        )

        expect(queryByTestId('oldPrice')).toBeNull()
    })

    it('should render total price with old price', () => {
        const {queryByTestId} = render(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmountDifferent}
                interval={interval}
                currency={currency}
            />
        )

        expect(queryByTestId('oldPrice')).toBeInTheDocument()
    })
})
