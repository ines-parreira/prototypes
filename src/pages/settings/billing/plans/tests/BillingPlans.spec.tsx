import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import _noop from 'lodash/noop'

import {
    basicPlan,
    proPlan,
    advancedPlan,
} from '../../../../../fixtures/subscriptionPlan'
import {BillingPlans} from '../BillingPlans.js'
import {account} from '../../../../../fixtures/account'

describe('<BillingPlans />', () => {
    it('should render a plan with default location', () => {
        const {container} = render(
            <BillingPlans
                currentAccount={fromJS(account)}
                currentPlan={fromJS(basicPlan)}
                plans={fromJS({
                    [basicPlan.id]: basicPlan,
                    [proPlan.id]: proPlan,
                    [advancedPlan.id]: advancedPlan,
                })}
                subscription={fromJS({})}
                shouldPayWithShopify={false}
                isTrialing={false}
                notify={_noop}
                isAllowedToChangePlan={_noop}
                updateSubscription={_noop}
                setFutureSubscriptionPlan={_noop}
                location={fromJS({location: {state: {}}})}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it.each([
        [
            'with opened popover on basic plan',
            {location: {state: {openedPlanPopover: 'Basic'}}},
        ],
        [
            'with opened popover on pro plan',
            {location: {state: {openedPlanPopover: 'Pro'}}},
        ],
    ])('should render a plan %s', (_, customProps) => {
        const {getByRole} = render(
            <BillingPlans
                currentAccount={fromJS(account)}
                currentPlan={fromJS(basicPlan)}
                plans={fromJS({
                    [basicPlan.id]: basicPlan,
                    [proPlan.id]: proPlan,
                    [advancedPlan.id]: advancedPlan,
                })}
                subscription={fromJS({})}
                shouldPayWithShopify={false}
                isTrialing={false}
                notify={_noop}
                isAllowedToChangePlan={_noop}
                updateSubscription={_noop}
                setFutureSubscriptionPlan={_noop}
                {...customProps}
            />,
            {container: document.body}
        )
        const tooltip = getByRole('tooltip')
        expect(tooltip).toMatchSnapshot()
    })
})
