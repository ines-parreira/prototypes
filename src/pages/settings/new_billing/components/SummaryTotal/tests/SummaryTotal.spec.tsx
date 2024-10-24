import {render, screen} from '@testing-library/react'
import React from 'react'

import {
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
} from 'fixtures/productPrices'
import {PlanInterval} from 'models/billing/types'
import {SelectedPlans} from 'pages/settings/new_billing/views/BillingProcessView/BillingProcessView'

import SummaryTotal from '../SummaryTotal'

const selectedPlans: SelectedPlans = {
    helpdesk: {
        isSelected: true,
        plan: basicMonthlyHelpdeskPlan,
    },
    automation: {
        isSelected: true,
        plan: basicMonthlyAutomationPlan,
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
    basicMonthlyHelpdeskPlan.amount + basicMonthlyAutomationPlan.amount
const totalProductAmountDifferent = totalProductAmount + 10000
const interval = PlanInterval.Month
const currency = 'USD'

describe('SummaryTotal', () => {
    it('should render total price without old price', () => {
        render(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                interval={interval}
                currency={currency}
            />
        )

        expect(screen.queryByLabelText('Old price')).not.toBeInTheDocument()
    })

    it('should render total price with old price', () => {
        render(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmountDifferent}
                interval={interval}
                currency={currency}
            />
        )

        expect(screen.getByLabelText('Old price')).toBeInTheDocument()
    })
})
