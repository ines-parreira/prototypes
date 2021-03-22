import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

import {BillingPlans} from '../plans/BillingPlans'
import {
    basicPlan,
    proPlan,
    customPlan,
} from '../../../../fixtures/subscriptionPlan.ts'
import {account} from '../../../../fixtures/account.ts'

describe('<BillingPlans/>', () => {
    const publicPlans = {
        [basicPlan.id]: basicPlan,
        [proPlan.id]: proPlan,
    }
    const legacyAccount = fromJS(account).set('created_datetime', '2021-01-31')
    const newAccount = fromJS(account).set('created_datetime', '2021-02-01')

    it.each([
        ['public plans', {plans: fromJS(publicPlans)}],
        [
            'a custom plan',
            {
                plans: fromJS({
                    [customPlan.id]: customPlan,
                    ...publicPlans,
                }),
            },
        ],
        ['plans with product features', {currentAccount: newAccount}],
        ['plans without product features', {currentAccount: legacyAccount}],
    ])('should display %s', (_, props) => {
        const {container} = render(
            <BillingPlans
                currentAccount={legacyAccount}
                notify={() => true}
                updateSubscription={() => true}
                isAllowedToChangePlan={() => true}
                plans={fromJS(publicPlans)}
                subscription={fromJS({plan: basicPlan.id})}
                currentPlan={fromJS(basicPlan)}
                location={{}}
                {...props}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
