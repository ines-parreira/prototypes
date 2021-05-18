import React from 'react'
import {render} from '@testing-library/react'
import {fromJS, Map} from 'immutable'
import _noop from 'lodash/noop'

import {BillingPlans} from '../BillingPlans.js'
import {
    basicPlan,
    proPlan,
    customPlan,
    advancedPlan,
    legacyPlan,
} from '../../../../../fixtures/subscriptionPlan'
import {account} from '../../../../../fixtures/account'

describe('<BillingPlans/>', () => {
    const publicPlans = {
        [basicPlan.id]: basicPlan,
        [proPlan.id]: proPlan,
        [advancedPlan.id]: advancedPlan,
    }
    const accountWithLegacyFeatures = (fromJS(account) as Map<
        string,
        unknown
    >).setIn(['meta', 'has_legacy_features'], true)
    const accountWithNewFeatures = fromJS(account)

    it.each([
        [
            'with available plans (legacy plan)',
            {
                currentPlan: fromJS(legacyPlan),
                plans: fromJS({
                    [legacyPlan.id]: legacyPlan,
                    ...publicPlans,
                }),
            },
        ],
        [
            'with available plans (plan with legacy features)',
            {
                currentAccount: accountWithLegacyFeatures,
                currentPlan: fromJS(basicPlan),
                plans: fromJS(publicPlans),
            },
        ],
        ['with available plans (public plan)', {}],
        [
            '(custom plan)',
            {
                currentPlan: fromJS(customPlan),
                plans: fromJS({
                    [customPlan.id]: customPlan,
                    ...publicPlans,
                }),
            },
        ],
        [
            'with available plans (with opened popover)',
            {location: {state: {openedPlanPopover: proPlan.name}}},
        ],
    ])('should display current plan %s', (_, props) => {
        const {container} = render(
            <BillingPlans
                currentAccount={accountWithNewFeatures}
                plans={fromJS(publicPlans)}
                subscription={fromJS({plan: basicPlan.id})}
                currentPlan={fromJS(basicPlan)}
                shouldPayWithShopify={false}
                isTrialing={false}
                notify={_noop}
                location={fromJS({location: {state: {}}})}
                updateSubscription={_noop}
                isAllowedToChangePlan={_noop}
                setFutureSubscriptionPlan={_noop}
                {...props}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
