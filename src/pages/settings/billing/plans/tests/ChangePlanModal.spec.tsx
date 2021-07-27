import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {fromJS, Map} from 'immutable'
import userEvent from '@testing-library/user-event'

import {proPlan} from '../../../../../fixtures/subscriptionPlan'
import {PlanInterval} from '../../../../../models/billing/types'
import SynchronizedScrollTopContainer from '../../../../common/components/SynchronizedScrollTop/SynchronizedScrollTopContainer'

import ChangePlanModal from '../ChangePlanModal'
import BillingPlanCard from '../BillingPlanCard'

jest.mock(
    '../BillingPlanCard',
    () => ({
        theme,
        renderBody,
        className,
    }: ComponentProps<typeof BillingPlanCard>) => (
        <div>
            BillingPlanCard mock,
            <div>theme: {theme}</div>
            <div>renderBody: {renderBody?.(<span>features mock</span>)}</div>
            <div>className: {className}</div>
        </div>
    )
)

jest.mock(
    '../../../../common/components/SynchronizedScrollTop/SynchronizedScrollTopContainer',
    () => ({height}: ComponentProps<typeof SynchronizedScrollTopContainer>) => (
        <div>
            SynchronizedScrollTopContainer mock,
            <div>height: {height}</div>
        </div>
    )
)

describe('<ChangePlanModal />', () => {
    const minProps = {
        confirmLabel: 'Confirm',
        currentPlan: fromJS({
            ...proPlan,
            id: `${proPlan.name.toLowerCase()}-monthly`,
            interval: PlanInterval.Month,
        }) as Map<any, any>,
        description: 'description of the plan change',
        header: 'Title of modal',
        isOpen: true,
        isUpdating: false,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
        renderComparedPlan: () => <div>renderComparedPlan</div>,
    }

    it('should not render the modal', () => {
        const {baseElement} = render(
            <ChangePlanModal {...minProps} isOpen={false} />
        )
        expect(baseElement).toMatchSnapshot()
    })

    it('should render', () => {
        const {baseElement} = render(<ChangePlanModal {...minProps} />)

        expect(baseElement).toMatchSnapshot()
    })

    it('should call onConfirm callback when clicking on button', () => {
        const {getByText} = render(<ChangePlanModal {...minProps} />)

        userEvent.click(getByText('Confirm'))
        expect(minProps.onConfirm).toHaveBeenCalled()
    })

    it('should display only compared plan when there is no current plan', () => {
        const {baseElement} = render(
            <ChangePlanModal {...minProps} currentPlan={fromJS({})} />
        )

        expect(baseElement).toMatchSnapshot()
    })
})
