import type { ComponentProps } from 'react'

import type { ResponseBillingState } from '@repo/billing'
import { BILLING_BASE_PATH, useBillingState } from '@repo/billing'
import { assumeMock, render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { useGetBillingEstimatesSubscription } from '@gorgias/helpdesk-queries'
import type {
    CustomerSummary,
    SubscriptionSummary,
} from '@gorgias/helpdesk-types'

import { UserRole } from 'config/types/user'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { updateSubscriptionsForPlans } from 'state/currentAccount/actions'
import type { SubscriptionUpdateResponse } from 'state/currentAccount/actions'
import type { RootState } from 'state/types'

import AutomateSubscriptionModal from '../AutomateSubscriptionModal'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        MidCycleUpgradeBillingLogic: 'MidCycleUpgradeBillingLogic',
    },
    useFlag: () => true,
}))

jest.mock('@repo/billing', () => ({
    ...jest.requireActual('@repo/billing'),
    useBillingState: jest.fn(),
}))
const mockUseBillingState = assumeMock(useBillingState)

jest.mock('@gorgias/helpdesk-queries', () => ({
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useGetBillingEstimatesSubscription: jest.fn(),
}))
const mockUseGetBillingEstimatesSubscription = assumeMock(
    useGetBillingEstimatesSubscription,
)

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
        location: { pathname: '/' },
    }),
}))

jest.mock('state/currentAccount/actions', () => ({
    ...jest.requireActual('state/currentAccount/actions'),
    updateSubscriptionsForPlans: jest.fn(),
}))
const mockUpdateSubscriptionsForPlans = assumeMock(updateSubscriptionsForPlans)

const defaultState: Partial<RootState> = {
    billing: fromJS(billingState),
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            ...account.current_subscription,
            status: 'active',
        },
    }),
    currentUser: fromJS({
        role: { name: UserRole.Admin },
    }),
}

function makeBillingState({
    customer = { credit_card: { last4: '4242' } } as CustomerSummary,
}: {
    customer?: Partial<CustomerSummary>
} = {}): ResponseBillingState {
    const subscription: SubscriptionSummary = {
        resource_version: 7,
        schedule_resource_version: 3,
        current_billing_cycle_end_datetime: '2026-05-23T00:00:00+00:00',
        downgrades: [],
        scheduled_changes: [],
        is_paused: false,
    } as unknown as SubscriptionSummary
    return {
        data: {
            subscription,
            customer: customer as CustomerSummary,
        } as ResponseBillingState['data'],
        isLoading: false,
    } as ResponseBillingState
}

const TestFooter = ({
    confirmLabel,
    onConfirm,
}: {
    confirmLabel: string
    onConfirm: () => void
}) => (
    <button type="button" onClick={onConfirm}>
        {confirmLabel}
    </button>
)

const minProps: ComponentProps<typeof AutomateSubscriptionModal> = {
    confirmLabel: 'I am sure',
    isOpen: true,
    onClose: jest.fn(),
    footer: TestFooter,
}

beforeEach(() => {
    mockUseBillingState.mockReturnValue(makeBillingState())
    mockUseGetBillingEstimatesSubscription.mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
    } as never)
    mockUpdateSubscriptionsForPlans.mockClear()
    mockUpdateSubscriptionsForPlans.mockImplementation(
        () => async (): Promise<SubscriptionUpdateResponse> => ({
            products: {},
        }),
    )
    mockHistoryPush.mockClear()
})

describe('<AutomateSubscriptionModal /> with the real ConfirmChangesModal', () => {
    it('renders the real Confirm changes overlay when subscribe is clicked', async () => {
        const user = userEvent.setup()

        render(<AutomateSubscriptionModal {...minProps} />, {
            storeState: defaultState,
        })

        await user.click(
            await screen.findByRole('button', { name: /i am sure/i }),
        )

        expect(
            await screen.findByRole('dialog', { name: /confirm changes/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /^confirm$/i }),
        ).toBeInTheDocument()
    })

    it('shows the payment-method-missing banner inside the real Confirm changes overlay', async () => {
        const user = userEvent.setup()
        mockUseBillingState.mockReturnValue(
            makeBillingState({ customer: {} as CustomerSummary }),
        )

        render(<AutomateSubscriptionModal {...minProps} />, {
            storeState: defaultState,
        })

        await user.click(
            await screen.findByRole('button', { name: /i am sure/i }),
        )

        expect(
            await screen.findByRole('dialog', { name: /confirm changes/i }),
        ).toBeInTheDocument()
        expect(
            await screen.findByText(/add a payment method to continue/i),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /^confirm$/i }),
        ).toHaveAttribute('aria-disabled', 'true')
    })

    it('submits and navigates after clicking the real Confirm button', async () => {
        const user = userEvent.setup()

        render(<AutomateSubscriptionModal {...minProps} />, {
            storeState: defaultState,
        })

        await user.click(
            await screen.findByRole('button', { name: /i am sure/i }),
        )
        await user.click(
            await screen.findByRole('button', { name: /^confirm$/i }),
        )

        await waitFor(() => {
            expect(mockUpdateSubscriptionsForPlans).toHaveBeenCalled()
        })
        expect(mockHistoryPush).toHaveBeenCalledWith(BILLING_BASE_PATH)
    })
})
