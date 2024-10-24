/* eslint-disable @typescript-eslint/no-unsafe-return */
import {screen, fireEvent, waitFor} from '@testing-library/react'
import React from 'react'

import {basicMonthlyHelpdeskPlan} from 'fixtures/productPrices'
import useSessionStorage from 'hooks/useSessionStorage'
import {PlanInterval, ProductType} from 'models/billing/types'
import {useBillingPlans} from 'pages/settings/new_billing/hooks/useBillingPlan'
import {SelectedPlans} from 'pages/settings/new_billing/views/BillingProcessView/BillingProcessView'
import * as selectors from 'state/currentAccount/selectors'
import {assumeMock, renderWithRouter} from 'utils/testing'

import {
    SubscriptionSummary,
    ISubscriptionSummaryProps,
} from '../SubscriptionSummary'

jest.mock('hooks/useAppSelector', () => (selector: () => any) => selector())
jest.mock('hooks/useSessionStorage')
jest.mock('pages/settings/new_billing/hooks/useBillingPlan')
jest.mock('react-redux', () => ({
    useDispatch: jest.fn(() => jest.fn()),
}))

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(() => ({
        push: jest.fn(),
    })),
}))

const selectedPlans: SelectedPlans = {
    [ProductType.Helpdesk]: {
        plan: basicMonthlyHelpdeskPlan,
        isSelected: true,
        autoUpgrade: false,
    },
    [ProductType.Automation]: {
        isSelected: false,
    },
    [ProductType.Voice]: {isSelected: false},
    [ProductType.SMS]: {isSelected: false},
    [ProductType.Convert]: {isSelected: false},
}

const defaultUseBillingPlansMockReturnValue = {
    helpdeskAvailablePlans: [basicMonthlyHelpdeskPlan],
    automateAvailablePlans: [],
    smsAvailablePlans: [],
    convertAvailablePlans: [],
    voiceAvailablePlans: [],
    anyDowngradedPlanSelected: false,
    totalProductAmount: 0,
    interval: PlanInterval.Month,
    isSubscriptionCanceled: false,
    selectedPlans,
} as unknown as ReturnType<typeof useBillingPlans>

const renderSubscriptionSummary = () => {
    const props: ISubscriptionSummaryProps = {
        contactBilling: jest.fn(),
        dispatchBillingError: jest.fn(),
        isPaymentMethodValid: true,
        isSubmitting: false,
        handleSubmit: jest.fn().mockResolvedValue(null),
    }

    const result = renderWithRouter(<SubscriptionSummary {...props} />)

    return {
        ...result,
        props,
    }
}

describe('SubscriptionSummary Component', () => {
    beforeEach(() => {
        assumeMock(useSessionStorage).mockReturnValue([null, () => {}]) // No selected plans in session storage
        assumeMock(useBillingPlans).mockReturnValue(
            defaultUseBillingPlansMockReturnValue
        )
    })

    it('should not render if the user is not trialing and there are no selected plans', () => {
        jest.spyOn(selectors, 'isTrialing').mockReturnValue(false)

        renderSubscriptionSummary()

        expect(screen.queryByText('Summary')).not.toBeInTheDocument()
    })

    it('should render the summary if the user is trialing', () => {
        jest.spyOn(selectors, 'isTrialing').mockReturnValue(true)

        renderSubscriptionSummary()

        expect(screen.getByText('Summary')).toBeInTheDocument()
    })

    it('should render the summary if the subscription is canceled and there are selected plans in session storage', () => {
        jest.spyOn(selectors, 'isTrialing').mockReturnValue(false)
        assumeMock(useSessionStorage).mockReturnValue([selectedPlans, () => {}])
        assumeMock(useBillingPlans).mockReturnValueOnce({
            ...defaultUseBillingPlansMockReturnValue,
            isSubscriptionCanceled: true,
        })

        renderSubscriptionSummary()

        expect(screen.getByText('Summary')).toBeInTheDocument()
    })

    it('should call handleSubmit when clicking on Subscribe now', async () => {
        jest.spyOn(selectors, 'isTrialing').mockReturnValue(true)
        assumeMock(useBillingPlans).mockReturnValueOnce({
            ...defaultUseBillingPlansMockReturnValue,
            isSubscriptionCanceled: false,
        })

        const {
            props: {handleSubmit},
        } = renderSubscriptionSummary()

        fireEvent.click(screen.getByLabelText(/I agree to the/))

        fireEvent.click(screen.getByText('Subscribe now'))

        await waitFor(() => {
            expect(handleSubmit).toHaveBeenCalled()
        })
    })
})
