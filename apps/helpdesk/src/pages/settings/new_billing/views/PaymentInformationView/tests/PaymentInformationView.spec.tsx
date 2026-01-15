import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { MemoryRouter } from 'react-router-dom'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyHelpdeskPlan,
    basicYearlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
    helpdeskProduct,
    legacyAutomatePlan,
    starterHelpdeskPlan,
} from 'fixtures/plans'
import type { HelpdeskPlan } from 'models/billing/types'
import { Cadence } from 'models/billing/types'
import { getCadenceName } from 'models/billing/utils'
import useProductCancellations from 'pages/settings/new_billing/hooks/useProductCancellations'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import type { PaymentInformationViewProps } from '../PaymentInformationView'
import PaymentInformationView from '../PaymentInformationView'

jest.mock('@repo/logging')
jest.mock('pages/settings/new_billing/hooks/useProductCancellations')

const logEventMock = assumeMock(logEvent)
const mockUseProductCancellations = assumeMock(useProductCancellations)

const defaultProps: PaymentInformationViewProps = {
    contactBilling: jest.fn(),
}

describe('PaymentInformationView', () => {
    beforeEach(() => {
        logEventMock.mockClear()
        mockUseProductCancellations.mockReturnValue({
            loading: false,
            error: undefined,
            data: new Map(),
        } as any)
    })

    it('should track BillingPaymentInformationTabVisited event on component mount', () => {
        const testPath = '/app/settings/billing/payment'

        renderWithStoreAndQueryClientProvider(
            <MemoryRouter initialEntries={[testPath]}>
                <PaymentInformationView {...defaultProps} />
            </MemoryRouter>,
            {
                billing: fromJS(billingState),
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPlan.plan_id,
                        },
                    },
                }),
            },
        )

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.BillingPaymentInformationTabVisited,
            { url: testPath },
        )
        expect(logEventMock).toHaveBeenCalledTimes(1)
    })

    it.each(Object.values(Cadence))(
        'should render billing frequency [%s]',
        (cadence: Cadence) => {
            const helpdeskPlan = helpdeskProduct.prices.find(
                (plan: HelpdeskPlan) => plan.cadence === cadence,
            )

            renderWithStoreAndQueryClientProvider(
                <MemoryRouter>
                    <PaymentInformationView {...defaultProps} />
                </MemoryRouter>,
                {
                    billing: fromJS(billingState),
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            products: {
                                [HELPDESK_PRODUCT_ID]: helpdeskPlan?.plan_id,
                            },
                        },
                    }),
                },
            )

            expect(screen.getByText(`All plans are billed`))
            expect(screen.getByText(`${getCadenceName(cadence).toLowerCase()}`))
        },
    )

    it('should ask the user to contact us to downgrade', async () => {
        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <PaymentInformationView {...defaultProps} />
            </MemoryRouter>,
            {
                billing: fromJS(billingState),
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicYearlyHelpdeskPlan.plan_id,
                        },
                    },
                }),
            },
        )

        await act(() => userEvent.hover(screen.getByText('Change Frequency')))

        expect(
            screen.getByText(`To downgrade billing frequency, please `, {
                exact: false,
            }),
        )
    })

    it('should ask the user to upgrade helpdesk plan if starter', async () => {
        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <PaymentInformationView {...defaultProps} />
            </MemoryRouter>,
            {
                billing: fromJS(billingState),
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        products: {
                            [HELPDESK_PRODUCT_ID]: starterHelpdeskPlan.plan_id,
                        },
                    },
                }),
            },
        )

        await act(() => userEvent.hover(screen.getByText('Change Frequency')))

        expect(
            screen.getByText(
                'To change billing frequency, upgrade your Helpdesk plan to Basic or higher',
            ),
        )
    })

    it('should ask the user to migrate to a non legacy automate plan', async () => {
        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <PaymentInformationView {...defaultProps} />
            </MemoryRouter>,
            {
                billing: fromJS(billingState),
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPlan.plan_id,
                            [AUTOMATION_PRODUCT_ID]: legacyAutomatePlan.plan_id,
                        },
                    },
                }),
            },
        )

        await act(() => userEvent.hover(screen.getByText('Change Frequency')))

        expect(
            screen.getByText(
                'To change billing frequency, update AI Agent to a non-legacy plan',
            ),
        )
    })

    it('should ask the user to contact us to reactivate a cancelled subscription', async () => {
        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <PaymentInformationView {...defaultProps} />
            </MemoryRouter>,
            {
                billing: fromJS(billingState),
                currentAccount: fromJS({
                    ...account,
                    current_subscription: null,
                }),
            },
        )

        await act(() => userEvent.hover(screen.getByText('Change Frequency')))

        expect(
            screen.getByText(
                'Your subscription is cancelled. To reactivate, please',
                { exact: false },
            ),
        )
    })

    it('should ask the user to contact us if some products are scheduled to cancel', async () => {
        mockUseProductCancellations.mockReturnValue({
            loading: false,
            error: undefined,
            data: new Map([
                [basicMonthlyHelpdeskPlan.plan_id, '2025-12-31T23:59:59Z'],
            ]),
        } as any)

        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <PaymentInformationView {...defaultProps} />
            </MemoryRouter>,
            {
                billing: fromJS(billingState),
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPlan.plan_id,
                        },
                    },
                }),
            },
        )

        await act(() => userEvent.hover(screen.getByText('Change Frequency')))

        expect(
            screen.getByText(
                'Some products are scheduled to cancel. To change your billing frequency or keep your products active, please',
                { exact: false },
            ),
        )
    })

    it('should allow changing frequency when no products are scheduled to cancel', () => {
        mockUseProductCancellations.mockReturnValue({
            loading: false,
            error: undefined,
            data: new Map(),
        } as any)

        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <PaymentInformationView {...defaultProps} />
            </MemoryRouter>,
            {
                billing: fromJS(billingState),
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPlan.plan_id,
                        },
                    },
                }),
            },
        )

        const link = screen.getByText('Change Frequency')
        expect(link).toHaveAttribute(
            'href',
            '/app/settings/billing/payment/frequency',
        )
    })
})
