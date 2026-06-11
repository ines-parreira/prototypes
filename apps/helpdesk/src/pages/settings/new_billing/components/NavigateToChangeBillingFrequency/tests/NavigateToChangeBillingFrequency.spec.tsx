import { useBillingState } from '@repo/billing'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicYearlyHelpdeskPlan,
    basicYearlyInvoicedMonthlyHelpdeskPlan,
    basicYearlyInvoicedQuarterlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
    legacyAutomatePlan,
    starterHelpdeskPlan,
} from 'fixtures/plans'
import { Cadence } from 'models/billing/types'
import { isOtherCadenceDowngrade } from 'models/billing/utils'
import { TicketPurpose } from 'state/billing/types'
import type { StoreState } from 'state/types'

import type { NavigateToChangeBillingFrequencyProps } from '../NavigateToChangeBillingFrequency'
import { NavigateToChangeBillingFrequency } from '../NavigateToChangeBillingFrequency'

import css from '../NavigateToChangeBillingFrequency.less'

jest.mock('@repo/logging')
jest.mock('@repo/billing', () => ({
    ...jest.requireActual('@repo/billing'),
    useBillingState: jest.fn(),
}))
const logEventMock = assumeMock(logEvent)
const mockUseBillingState = assumeMock(useBillingState)
const store: Partial<StoreState> = {
    billing: fromJS(billingState),
    currentAccount: fromJS(account),
}
const contactBillingMock = jest.fn()
const props: NavigateToChangeBillingFrequencyProps = {
    buttonText: 'Change Frequency',
    tooltipPlacement: 'top',
    contactBilling: contactBillingMock,
    trackingEvent: SegmentEvent.BillingPaymentInformationChangeFrequencyClicked,
}
describe('NavigateToChangeBillingFrequency', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        logEventMock.mockClear()
        mockUseBillingState.mockReturnValue({
            isLoading: false,
            data: undefined,
        } as any)
    })
    it('should render the correct button text', () => {
        render(<NavigateToChangeBillingFrequency {...props} />, {
            storeState: store,
        })
        expect(screen.getByText('Change Frequency')).toBeInTheDocument()
    })
    it('should tell the user to upgrade if on a starter helpdesk plan', async () => {
        render(<NavigateToChangeBillingFrequency {...props} />, {
            storeState: {
                ...store,
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        products: {
                            ...account.current_subscription.products,
                            [HELPDESK_PRODUCT_ID]: starterHelpdeskPlan.plan_id,
                        },
                    },
                }),
            },
        })
        const button = screen.getByText('Change Frequency')
        expect(button).toBeInTheDocument()
        expect(button).toHaveClass(css.disabledText)
        await act(() => userEvent.hover(button))
        const tooltip = screen.getByRole('tooltip')
        expect(tooltip).toBeInTheDocument()
        expect(tooltip).toHaveTextContent(
            'To change billing frequency, upgrade your Helpdesk plan to Basic or higher',
        )
    })
    it('should tell the user to upgrade if on a legacy automate plan', async () => {
        render(<NavigateToChangeBillingFrequency {...props} />, {
            storeState: {
                ...store,
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        products: {
                            ...account.current_subscription.products,
                            [AUTOMATION_PRODUCT_ID]: legacyAutomatePlan.plan_id,
                        },
                    },
                }),
            },
        })
        const button = screen.getByText('Change Frequency')
        expect(button).toBeInTheDocument()
        expect(button).toHaveClass(css.disabledText)
        await act(() => userEvent.hover(button))
        const tooltip = screen.getByRole('tooltip')
        expect(tooltip).toBeInTheDocument()
        expect(tooltip).toHaveTextContent(
            'To change billing frequency, update AI Agent to a non-legacy plan',
        )
    })
    it('should tell the user to contact us if their subscription is cancelled', async () => {
        render(<NavigateToChangeBillingFrequency {...props} />, {
            storeState: {
                ...store,
                currentAccount: fromJS({
                    ...account,
                    current_subscription: null,
                }),
            },
        })
        const button = screen.getByText('Change Frequency')
        expect(button).toBeInTheDocument()
        expect(button).toHaveClass(css.disabledText)
        await act(() => userEvent.hover(button))
        const tooltip = screen.getByRole('tooltip')
        expect(tooltip).toBeInTheDocument()
        expect(tooltip).toHaveTextContent(
            'Your subscription is cancelled. To reactivate, please',
        )
        const contact = screen.getByText('get in touch')
        await act(() => userEvent.click(contact))
        expect(contactBillingMock).toHaveBeenCalledWith(
            TicketPurpose.CONTACT_US,
        )
    })
    it('should tell the user to contact support when billing is paused', async () => {
        mockUseBillingState.mockReturnValue({
            isLoading: false,
            data: { subscription: { is_paused: true } },
        } as any)
        render(<NavigateToChangeBillingFrequency {...props} />, {
            storeState: store,
        })
        const button = screen.getByText('Change Frequency')
        expect(button).toBeInTheDocument()
        expect(button).toHaveClass(css.disabledText)
        await act(() => userEvent.hover(button))
        const tooltip = screen.getByRole('tooltip')
        expect(tooltip).toBeInTheDocument()
        expect(tooltip).toHaveTextContent(
            'Your billing is paused. Please contact support to make changes.',
        )
    })
    it('should tell the user to contact us if their subscription is scheduled to cancel', async () => {
        render(<NavigateToChangeBillingFrequency {...props} />, {
            storeState: {
                ...store,
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        scheduled_to_cancel_at: '2017-09-23T01:38:53+00:00',
                    },
                }),
            },
        })
        const button = screen.getByText('Change Frequency')
        expect(button).toBeInTheDocument()
        expect(button).toHaveClass(css.disabledText)
        await act(() => userEvent.hover(button))
        const tooltip = screen.getByRole('tooltip')
        expect(tooltip).toBeInTheDocument()
        expect(tooltip).toHaveTextContent(
            'Your subscription is scheduled to cancel. To reactivate, please',
        )
        const contact = screen.getByText('get in touch')
        await act(() => userEvent.click(contact))
        expect(contactBillingMock).toHaveBeenCalledWith(
            TicketPurpose.CONTACT_US,
        )
    })
    const cadenceValues = Object.values(Cadence)
    const cadenceDowndgrades = cadenceValues
        .flatMap((a) => cadenceValues.map((b) => [a, b]))
        .filter(([a, b]) => isOtherCadenceDowngrade(a, b))
    it.each(cadenceDowndgrades)(
        'should tell the user to contact us when downgrading billing frequency',
        async () => {
            render(<NavigateToChangeBillingFrequency {...props} />, {
                storeState: {
                    ...store,
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            products: {
                                ...account.current_subscription.products,
                                [HELPDESK_PRODUCT_ID]:
                                    basicYearlyHelpdeskPlan.plan_id,
                            },
                        },
                    }),
                },
            })
            const button = screen.getByText('Change Frequency')
            expect(button).toBeInTheDocument()
            expect(button).toHaveClass(css.disabledText)
            await act(() => userEvent.hover(button))
            const tooltip = screen.getByRole('tooltip')
            expect(tooltip).toBeInTheDocument()
            expect(tooltip).toHaveTextContent(
                'To downgrade billing frequency, please get in touch with our team.',
            )
            const contact = screen.getByText('get in touch')
            await act(() => userEvent.click(contact))
            expect(contactBillingMock).toHaveBeenCalledWith(
                TicketPurpose.BILLING_FREQUENCY_DOWNGRADE,
            )
        },
    )
    it('should tell the user to contact us if some products are scheduled to cancel', async () => {
        const cancellationsByPlanId = new Map([
            [basicYearlyHelpdeskPlan.plan_id, '2025-12-31T23:59:59Z'],
        ])
        render(
            <NavigateToChangeBillingFrequency
                {...props}
                cancellationsByPlanId={cancellationsByPlanId}
            />,
            { storeState: store },
        )
        const button = screen.getByText('Change Frequency')
        expect(button).toBeInTheDocument()
        expect(button).toHaveClass(css.disabledText)
        await act(() => userEvent.hover(button))
        const tooltip = screen.getByRole('tooltip')
        expect(tooltip).toBeInTheDocument()
        expect(tooltip).toHaveTextContent(
            'Some products are scheduled to cancel. To change your billing frequency or keep your products active, please',
        )
        const contact = screen.getByText('get in touch')
        await act(() => userEvent.click(contact))
        expect(contactBillingMock).toHaveBeenCalledWith(
            TicketPurpose.CONTACT_US,
        )
    })
    it('should not show cancellation tooltip when cancellationsByPlanId is empty', () => {
        const cancellationsByPlanId = new Map()
        render(
            <NavigateToChangeBillingFrequency
                {...props}
                cancellationsByPlanId={cancellationsByPlanId}
            />,
            { storeState: store },
        )
        const link = screen.getByText('Change Frequency')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
            'href',
            '/app/settings/billing/payment/frequency',
        )
    })
    it.each([
        ['monthly invoice', basicYearlyInvoicedMonthlyHelpdeskPlan],
        ['quarterly invoice', basicYearlyInvoicedQuarterlyHelpdeskPlan],
    ])(
        'should show custom plan tooltip when cadence is year and invoice_cadence is %s',
        async (_invoiceCadence, customPlan) => {
            const helpdeskProductIndex = billingState.products.findIndex(
                (product) => product.type === HELPDESK_PRODUCT_ID,
            )
            const updatedProducts = [...billingState.products]
            updatedProducts[helpdeskProductIndex] = {
                ...updatedProducts[helpdeskProductIndex],
                prices: [
                    ...updatedProducts[helpdeskProductIndex].prices,
                    customPlan,
                ],
            }
            render(<NavigateToChangeBillingFrequency {...props} />, {
                storeState: {
                    ...store,
                    billing: fromJS({
                        ...billingState,
                        products: updatedProducts,
                    }),
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            products: {
                                ...account.current_subscription.products,
                                [HELPDESK_PRODUCT_ID]: customPlan.plan_id,
                            },
                        },
                    }),
                },
            })
            const button = screen.getByText('Change Frequency')
            expect(button).toBeInTheDocument()
            expect(button).toHaveClass(css.disabledText)
            await act(() => userEvent.hover(button))
            const tooltip = screen.getByRole('tooltip')
            expect(tooltip).toBeInTheDocument()
            expect(tooltip).toHaveTextContent(
                `Because you're on a custom plan, please contact our team to make changes`,
            )
            const contact = screen.getByText('contact our team')
            await act(() => userEvent.click(contact))
            expect(contactBillingMock).toHaveBeenCalledWith(
                TicketPurpose.BILLING_FREQUENCY_DOWNGRADE,
            )
        },
    )
    it('should show downgrade tooltip when currentHelpdeskPlan is undefined', async () => {
        render(<NavigateToChangeBillingFrequency {...props} />, {
            storeState: {
                ...store,
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        products: {
                            [AUTOMATION_PRODUCT_ID]:
                                account.current_subscription.products[
                                    AUTOMATION_PRODUCT_ID
                                ],
                        },
                    },
                }),
            },
        })
        const button = screen.getByText('Change Frequency')
        expect(button).toBeInTheDocument()
        expect(button).toHaveClass(css.disabledText)
        await act(() => userEvent.hover(button))
        const tooltip = screen.getByRole('tooltip')
        expect(tooltip).toBeInTheDocument()
        expect(tooltip).toHaveTextContent(
            'To downgrade billing frequency, please get in touch with our team.',
        )
        const contact = screen.getByText('get in touch')
        await act(() => userEvent.click(contact))
        expect(contactBillingMock).toHaveBeenCalledWith(
            TicketPurpose.BILLING_FREQUENCY_DOWNGRADE,
        )
    })
    describe('BillingPaymentInformationChangeFrequencyClicked tracking', () => {
        it('should track event when Change Frequency link is clicked', async () => {
            render(<NavigateToChangeBillingFrequency {...props} />, {
                storeState: store,
            })
            const link = screen.getByText('Change Frequency')
            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute(
                'href',
                '/app/settings/billing/payment/frequency',
            )
            logEventMock.mockClear()
            await act(() => userEvent.click(link))
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingPaymentInformationChangeFrequencyClicked,
            )
            expect(logEventMock).toHaveBeenCalledTimes(1)
        })
        it('should NOT track event when button is disabled (starter plan)', async () => {
            render(<NavigateToChangeBillingFrequency {...props} />, {
                storeState: {
                    ...store,
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            products: {
                                ...account.current_subscription.products,
                                [HELPDESK_PRODUCT_ID]:
                                    starterHelpdeskPlan.plan_id,
                            },
                        },
                    }),
                },
            })
            const button = screen.getByText('Change Frequency')
            expect(button).toHaveClass(css.disabledText)
            logEventMock.mockClear()
            await act(() => userEvent.click(button))
            expect(logEventMock).not.toHaveBeenCalled()
        })
    })
})
