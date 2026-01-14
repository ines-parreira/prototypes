import { render, waitFor } from '@testing-library/react'

import { basicMonthlyAutomationPlan, convertPlan0 } from 'fixtures/plans'
import { Cadence, ProductType } from 'models/billing/types'
import { getProductInfo } from 'models/billing/utils'
import CounterText from 'pages/settings/new_billing/components/CounterText/CounterText'

describe('CounterText', () => {
    it('should render the trial price text', () => {
        const props = {
            plan: convertPlan0,
            type: ProductType.Convert,
            cadence: Cadence.Month,
        }

        const { getByText } = render(<CounterText {...props} />)

        expect(getByText('$1')).toBeInTheDocument()
        expect(getByText('per click')).toBeInTheDocument()
    })

    it('should render the regular price text', async () => {
        const type = ProductType.Automation
        const cadence = Cadence.Year

        const props = {
            plan: basicMonthlyAutomationPlan,
            type: type,
            cadence: cadence,
        }
        const productInfo = getProductInfo(type, basicMonthlyAutomationPlan)

        const { getByText } = render(<CounterText {...props} />)

        await waitFor(() => {
            expect(
                getByText(productInfo.counter, { exact: false }),
            ).toBeInTheDocument()
            expect(getByText(cadence, { exact: false })).toBeInTheDocument()
        })
    })
})
