import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import {PlanInterval} from '../../../../../models/billing/types'
import TotalAmount from '../TotalAmount'

describe('<TotalAmount />', () => {
    const minProps: ComponentProps<typeof TotalAmount> = {
        addOnAmount: 'Amount',
        plan: {
            id: 'planId',
        },
        isAutomationChecked: false,
    }

    it('should render a string as amount', () => {
        const {container} = render(<TotalAmount {...minProps} />)
        expect(container).toMatchSnapshot()
    })

    it('should render formatted numbers as amount', () => {
        const {container} = render(
            <TotalAmount
                {...minProps}
                addOnAmount={45612}
                plan={{
                    id: 'planId',
                    interval: PlanInterval.Month,
                    amount: 40000,
                    currency: 'usd',
                }}
            />
        )
        expect(container).toMatchSnapshot()
    })

    it('should render not editable variant', () => {
        const {container} = render(
            <TotalAmount
                {...minProps}
                addOnAmount={2000}
                plan={{
                    id: 'planId',
                    interval: PlanInterval.Month,
                    amount: 40000,
                    currency: 'usd',
                }}
                isEditable={false}
            />
        )
        expect(container).toMatchSnapshot()
    })
})
