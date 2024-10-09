import {render, waitFor} from '@testing-library/react'
import React from 'react'
import {basicMonthlyAutomationPlan, convertPlan0} from 'fixtures/productPrices'
import {PlanInterval, ProductType} from 'models/billing/types'
import CounterText from 'pages/settings/new_billing/components/CounterText/CounterText'
import {PRODUCT_INFO} from 'pages/settings/new_billing/constants'

describe('CounterText', () => {
    it('should render the trial price text', () => {
        const props = {
            plan: convertPlan0,
            type: ProductType.Convert,
            interval: PlanInterval.Month,
        }

        const {getByText} = render(<CounterText {...props} />)

        expect(getByText('$1')).toBeInTheDocument()
        expect(getByText('per click')).toBeInTheDocument()
    })

    it('should render the regular price text', async () => {
        const type = ProductType.Automation
        const interval = PlanInterval.Year

        const props = {
            plan: basicMonthlyAutomationPlan,
            type: type,
            interval: interval,
        }

        const {getByText} = render(<CounterText {...props} />)

        await waitFor(() => {
            expect(
                getByText(PRODUCT_INFO[type].counter, {exact: false})
            ).toBeInTheDocument()
            expect(getByText(interval, {exact: false})).toBeInTheDocument()
        })
    })
})
