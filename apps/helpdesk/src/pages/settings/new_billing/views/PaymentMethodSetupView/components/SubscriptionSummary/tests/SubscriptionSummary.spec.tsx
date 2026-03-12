/* eslint-disable @typescript-eslint/no-unsafe-return */
import { FeatureFlagKey } from '@repo/feature-flags'
import { Form } from '@repo/forms'
import { useSessionStorage } from '@repo/hooks'
import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { mockFlags } from 'jest-launchdarkly-mock'

import { basicMonthlyHelpdeskPlan } from 'fixtures/plans'
import { Cadence, ProductType } from 'models/billing/types'
import { useBillingPlans } from 'pages/settings/new_billing/hooks/useBillingPlan'
import type { SelectedPlans } from 'pages/settings/new_billing/types'
import * as selectors from 'state/currentAccount/selectors'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import type { ISubscriptionSummaryProps } from '../SubscriptionSummary'
import { SubscriptionSummary } from '../SubscriptionSummary'

jest.mock('hooks/useAppSelector', () => (selector: () => any) => selector())
jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useSessionStorage: jest.fn(),
}))
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

const queryClient = mockQueryClient()

const selectedPlans: SelectedPlans = {
    [ProductType.Helpdesk]: {
        plan: basicMonthlyHelpdeskPlan,
        isSelected: true,
        autoUpgrade: false,
    },
    [ProductType.Automation]: {
        isSelected: false,
    },
    [ProductType.Voice]: { isSelected: false },
    [ProductType.SMS]: { isSelected: false },
    [ProductType.Convert]: { isSelected: false },
}

const defaultUseBillingPlansMockReturnValue = {
    helpdeskAvailablePlans: [basicMonthlyHelpdeskPlan],
    automateAvailablePlans: [],
    smsAvailablePlans: [],
    convertAvailablePlans: [],
    voiceAvailablePlans: [],
    anyDowngradedPlanSelected: false,
    totalProductAmount: 0,
    cadence: Cadence.Month,
    isSubscriptionCanceled: false,
    selectedPlans,
} as unknown as ReturnType<typeof useBillingPlans>

const renderSubscriptionSummary = () => {
    const props: ISubscriptionSummaryProps = {
        dispatchBillingError: jest.fn(),
        onValidSubmit: jest.fn().mockResolvedValue(null),
    }

    const result = renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Form onValidSubmit={props.onValidSubmit}>
                <SubscriptionSummary {...props} />
            </Form>
        </QueryClientProvider>,
    )

    return {
        ...result,
        props,
    }
}

describe('SubscriptionSummary Component', () => {
    beforeEach(() => {
        assumeMock(useSessionStorage).mockReturnValue([null, () => {}]) // No selected plans in session storage
        assumeMock(useBillingPlans).mockReturnValue(
            defaultUseBillingPlansMockReturnValue,
        )
        mockFlags({
            [FeatureFlagKey.BillingSummaryTotalWithCoupons]: false,
        })
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
            props: { onValidSubmit },
        } = renderSubscriptionSummary()

        fireEvent.click(screen.getByLabelText(/I agree to the/))

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Subscribe now' }),
            ).toBeAriaEnabled()
        })

        fireEvent.click(screen.getByRole('button', { name: 'Subscribe now' }))

        await waitFor(() => {
            expect(onValidSubmit).toHaveBeenCalled()
        })
    })
})
