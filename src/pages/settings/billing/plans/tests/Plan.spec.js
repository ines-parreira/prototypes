import React from 'react'
import {fromJS} from 'immutable'
import {render, fireEvent, act} from '@testing-library/react'

import {
    advancedPlan,
    basicPlan,
    customPlan,
    enterprisePlan,
    proPlan,
} from '../../../../../fixtures/subscriptionPlan.ts'
import {countFeatures, Plan} from '../Plan'
import {account} from '../../../../../fixtures/account.ts'

describe('<Plan/>', () => {
    const accountWithLegacyFeatures = fromJS(account).setIn(
        ['meta', 'has_legacy_features'],
        true
    )
    const accountWithNewFeatures = fromJS(account)

    it.each([
        [
            'the current plan',
            {
                isCurrentPlan: true,
            },
        ],
        ['a plan without a current plan', {currentPlan: fromJS({})}],
        [
            'the current plan with legacy features',
            {
                currentAccount: accountWithLegacyFeatures,
                isCurrentPlan: true,
                isLegacyPlan: true,
            },
        ],
        ['a plan featured', {isFeatured: true}],
        ['a plan being selected', {isUpdating: true}],
        ['a plan without comparaison mode', {comparaisonMode: false}],
        ['a plan with custom class names', {className: 'custom-classname'}],
        [
            'a plan with a cheaper plan',
            {plan: fromJS(proPlan), cheaperPlan: fromJS(basicPlan)},
        ],
        [
            'a custom plan',
            {
                plan: fromJS(customPlan),
            },
        ],
        [
            'an enterprise plan',
            {
                plan: fromJS({
                    id: 'enterprise',
                    name: 'Enterprise',
                    features: [],
                }),
            },
        ],
    ])('should render %s', (_, customProps) => {
        const {container} = render(
            <Plan
                plan={fromJS(basicPlan)}
                currentAccount={accountWithNewFeatures}
                currentPlan={fromJS(basicPlan)}
                {...customProps}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it.each([
        [
            'subscription plan is different',
            {
                isUpdating: false,
                plan: fromJS(basicPlan),
                currentPlan: fromJS(proPlan),
            },
        ],
    ])(
        'should ask confirmation before choosing a plan because %s',
        (_, customProps) => {
            const mockedFunction = jest.fn()
            const {queryByTestId} = render(
                <Plan
                    plan={fromJS(proPlan)}
                    currentPlan={fromJS(basicPlan)}
                    currentAccount={accountWithNewFeatures}
                    onClick={() => mockedFunction()}
                    {...customProps}
                />
            )
            const button = queryByTestId('choose-plan-button')
            act(() => {
                fireEvent.click(button)
            })
            const confirmButton = queryByTestId('confirm-choose-plan-button')
            act(() => {
                fireEvent.click(confirmButton)
            })
            expect(mockedFunction).toHaveBeenLastCalledWith()
            expect(mockedFunction).toHaveBeenCalledTimes(1)
        }
    )
})

describe('countFeatures()', () => {
    it.each([
        [0, basicPlan],
        [8, proPlan],
        [12, advancedPlan],
        [12, enterprisePlan],
        [8, customPlan],
    ])('should return %d features', (expected, plan) => {
        expect(countFeatures(plan.features)).toBe(expected)
    })
})
