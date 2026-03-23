import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    basicMonthlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
    products,
} from 'fixtures/plans'
import { ProductType } from 'models/billing/types'
import { BILLING_BASE_PATH } from 'pages/settings/new_billing/constants'
import type { SelectedPlans } from 'pages/settings/new_billing/types'
import type { RootState, StoreDispatch } from 'state/types'

import type { SummaryFooterProps } from '../SummaryFooter'
import SummaryFooter from '../SummaryFooter'

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>([
    thunk,
])

const store = mockedStore({
    billing: fromJS({
        currentAccount: fromJS({
            current_subscription: {
                products: {
                    [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                },
            },
        }),
        products,
    }),
})

const mockHistoryPush = jest.fn()

jest.mock('utils/errors', () => ({
    reportError: jest.fn(),
}))

jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            useHistory: () => ({
                push: mockHistoryPush,
            }),
        }) as Record<string, unknown>,
)

describe('SummaryFooter', () => {
    const mockUpdateSubscription = jest.fn(async () => undefined)

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const props: SummaryFooterProps = {
        isPaymentEnabled: true,
        isTrialing: false,
        anyProductChanged: true,
        anyNewProductSelected: true,
        anyDowngradedPlanSelected: true,
        updateSubscription: mockUpdateSubscription,
        periodEnd: '2020-12-31',
        ctaText: 'Update Subscription',
    }

    it('disables the container when isPaymentEnabled is false', () => {
        const { container } = render(
            <Provider store={store}>
                <SummaryFooter {...props} isPaymentEnabled={false} />
            </Provider>,
        )

        expect(container.firstChild).toHaveClass('disabled')
    })

    it('renders legal text and checkboxes when anyProductChanged is true', () => {
        render(
            <Provider store={store}>
                <SummaryFooter {...props} />
            </Provider>,
        )

        expect(
            screen.getByText(
                /You agree to be charged in accordance with the subscription plan/,
            ),
        ).toBeInTheDocument()
        expect(screen.getByText(/I agree to the/)).toBeInTheDocument()
    })

    it('does not render checkboxes when anyNewProductSelected is false', () => {
        render(
            <Provider store={store}>
                <SummaryFooter {...props} anyNewProductSelected={false} />
            </Provider>,
        )

        expect(screen.queryByText(/I agree to the/)).not.toBeInTheDocument()
    })

    it('renders downgrade text when anyDowngradedPlanSelected is true and anyNewProductSelected is false', () => {
        render(
            <Provider store={store}>
                <SummaryFooter {...props} anyNewProductSelected={false} />
            </Provider>,
        )

        expect(
            screen.queryByText(
                /Changes to your subscription will apply starting/,
            ),
        ).toBeInTheDocument()
    })

    it('enables the update subscription button when all conditions are met', () => {
        render(
            <Provider store={store}>
                <SummaryFooter {...props} anyNewProductSelected={false} />
            </Provider>,
        )
        const button = screen.getByText('Update Subscription')
        expect(button).toBeEnabled()
    })

    it('calls handleSubscribe when the update subscription button is clicked', async () => {
        const user = userEvent.setup()
        render(
            <Provider store={store}>
                <SummaryFooter {...props} anyNewProductSelected={false} />
            </Provider>,
        )
        const button = screen.getByText('Update Subscription')
        await user.click(button)

        expect(mockUpdateSubscription).toHaveBeenCalled()
        await waitFor(() => {
            expect(mockHistoryPush).toHaveBeenCalledWith(BILLING_BASE_PATH)
        })
    })

    it('calls onOpenConfirmationModal when provided', async () => {
        const user = userEvent.setup()
        const onOpenConfirmationModal = jest.fn()

        render(
            <Provider store={store}>
                <SummaryFooter
                    {...props}
                    anyNewProductSelected={false}
                    onOpenConfirmationModal={onOpenConfirmationModal}
                />
            </Provider>,
        )

        await user.click(screen.getByText('Update Subscription'))

        expect(onOpenConfirmationModal).toHaveBeenCalled()
        expect(mockHistoryPush).not.toHaveBeenCalled()
    })

    it('calls setSessionSelectedPlans with selectedPlans when subscription is updated', async () => {
        const user = userEvent.setup()
        const mockSetSessionSelectedPlans = jest.fn()
        const selectedPlans: SelectedPlans = {
            [ProductType.Helpdesk]: {
                plan: basicMonthlyHelpdeskPlan,
                isSelected: true,
            },
            [ProductType.Automation]: {
                isSelected: false,
            },
            [ProductType.Voice]: {
                isSelected: false,
            },
            [ProductType.SMS]: {
                isSelected: false,
            },
            [ProductType.Convert]: {
                isSelected: false,
            },
        }

        render(
            <Provider store={store}>
                <SummaryFooter
                    {...props}
                    anyNewProductSelected={false}
                    selectedPlans={selectedPlans}
                    setSessionSelectedPlans={mockSetSessionSelectedPlans}
                />
            </Provider>,
        )
        const button = screen.getByText('Update Subscription')
        await user.click(button)

        expect(mockUpdateSubscription).toHaveBeenCalled()
        await waitFor(() => {
            expect(mockSetSessionSelectedPlans).toHaveBeenCalledWith(
                selectedPlans,
            )
        })
    })
})
