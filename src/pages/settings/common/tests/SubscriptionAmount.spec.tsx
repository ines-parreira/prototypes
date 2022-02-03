import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import SubscriptionAmount from '../SubscriptionAmount'
import {PlanInterval} from '../../../../models/billing/types'
import Tooltip from '../../../common/components/Tooltip'

jest.mock(
    '../../../common/components/Tooltip',
    () =>
        ({children}: ComponentProps<typeof Tooltip>) =>
            <div>{children}</div>
)

describe('<SubscriptionAmount />', () => {
    const minProps: ComponentProps<typeof SubscriptionAmount> = {
        currency: 'eur',
        interval: 'week',
    }

    it('should render', () => {
        const {container} = render(<SubscriptionAmount {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should format amount', () => {
        const {container} = render(
            <SubscriptionAmount {...minProps} amount={1000} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should format discount amount', () => {
        const {container} = render(
            <SubscriptionAmount {...minProps} discountedAmount={2000} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with discounted amount', () => {
        const {container} = render(
            <SubscriptionAmount
                {...minProps}
                amount={1000}
                discountedAmount={2000}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it.each(Object.values(PlanInterval))(
        'should abbreviate known intervals when isIntervalAbbreviated prop is passed',
        (interval) => {
            const {container} = render(
                <SubscriptionAmount
                    {...minProps}
                    interval={interval}
                    amount={1000}
                    isIntervalAbbreviated
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it('should not abbreviate unknown intervals when isIntervalAbbreviated prop is passed', () => {
        const {container} = render(
            <SubscriptionAmount
                {...minProps}
                amount={1000}
                isIntervalAbbreviated
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render tooltip content', () => {
        const {container} = render(
            <SubscriptionAmount
                {...minProps}
                tooltipContent={<div>Tooltip content</div>}
            />
        )
        expect(container.children[1]).toMatchSnapshot()
    })
})
