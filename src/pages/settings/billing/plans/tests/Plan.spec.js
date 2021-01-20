import React from 'react'
import {fromJS} from 'immutable'
import {render, fireEvent, act} from '@testing-library/react'

import {basicPlan, proPlan} from '../../../../../fixtures/subscriptionPlan.ts'
import {Plan} from '../Plan'

describe('<Plan/>', () => {
    it.each([
        ['with default props', {}],
        ['with no current plan', {currentPlan: fromJS({})}],
        [
            'different from the current plan',
            {plan: fromJS(proPlan), currentPlan: fromJS(basicPlan)},
        ],
        [
            'identical to the current plan',
            {plan: fromJS(proPlan), currentPlan: fromJS(proPlan)},
        ],
        ['with no footer', {showFooter: false}],
        ['without product features', {showProductFeatures: false}],
        ['featured', {isFeatured: true}],
        ['being selected', {isUpdating: true}],
        ['with custom class names', {className: 'custom-classname'}],
        [
            'with cheaper plan',
            {plan: fromJS(proPlan), cheaperPlan: fromJS(basicPlan)},
        ],
        [
            'Enterprise',
            {
                plan: fromJS({
                    id: 'enterprise',
                    name: 'Enterprise',
                    features: [],
                }),
            },
        ],
    ])('should render a plan %s', (_, customProps) => {
        const {container} = render(
            <Plan
                plan={fromJS(proPlan)}
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

    it.each([
        [
            'subscription plan is the same',
            {
                plan: fromJS(proPlan),
                currentPlan: fromJS(proPlan),
            },
        ],
        ['subscription is being updated', {isUpdating: true}],
    ])('should not allow to choose plan because %s', (_, customProps) => {
        const mockedFunction = jest.fn()
        const {queryByTestId} = render(
            <Plan
                plan={fromJS(basicPlan)}
                currentPlan={fromJS(proPlan)}
                onClick={() => mockedFunction()}
                {...customProps}
            />
        )
        const button = queryByTestId('choose-plan-button')
        act(() => {
            fireEvent.click(button)
        })
        const confirmButton = queryByTestId('confirm-choose-plan-button')
        expect(confirmButton).toBe(null)
        expect(mockedFunction).not.toHaveBeenCalled()
    })
})
