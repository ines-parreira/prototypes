import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    basicYearlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
    helpdeskProduct,
    starterHelpdeskPlan,
} from 'fixtures/productPrices'
import { AutomatePlan, Cadence, HelpdeskPlan } from 'models/billing/types'
import { getCadenceName } from 'models/billing/utils'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import PaymentInformationView, {
    PaymentInformationViewProps,
} from '../PaymentInformationView'

const defaultProps: PaymentInformationViewProps = {
    contactBilling: jest.fn(),
    currentHelpdeskPlan: basicMonthlyHelpdeskPlan,
    currentAutomatePlan: basicMonthlyAutomationPlan,
    isCurrentSubscriptionCanceled: false,
}

describe('PaymentInformationView', () => {
    it.each(Object.values(Cadence))(
        'should render billing frequency [%s]',
        (cadence: Cadence) => {
            const helpdeskPlan = helpdeskProduct.prices.find(
                (plan: HelpdeskPlan) => plan.cadence === cadence,
            )

            renderWithStoreAndQueryClientProvider(
                <PaymentInformationView
                    {...{
                        ...defaultProps,
                        currentHelpdeskPlan: helpdeskPlan,
                        currentAutomatePlan: undefined,
                    }}
                />,
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
            <PaymentInformationView
                {...{
                    ...defaultProps,
                    currentHelpdeskPlan: basicYearlyHelpdeskPlan,
                    currentAutomatePlan: undefined,
                }}
            />,
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
            screen.getByText(
                `To switch from ${getCadenceName(Cadence.Year)} to ${getCadenceName(Cadence.Month)} billing, please `,
                { exact: false },
            ),
        )
    })

    it('should ask the user to upgrade helpdesk plan if starter', async () => {
        renderWithStoreAndQueryClientProvider(
            <PaymentInformationView
                {...{
                    ...defaultProps,
                    currentHelpdeskPlan: starterHelpdeskPlan,
                    currentAutomatePlan: undefined,
                }}
            />,
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
        const legacyAutomatePlan: AutomatePlan = {
            ...basicMonthlyAutomationPlan,
            num_quota_tickets: null as unknown as number, // Force the typing to allow null to create this legacy plan
        }

        renderWithStoreAndQueryClientProvider(
            <PaymentInformationView
                {...{
                    ...defaultProps,
                    currentHelpdeskPlan: basicMonthlyHelpdeskPlan,
                    currentAutomatePlan: legacyAutomatePlan,
                }}
            />,
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
            <PaymentInformationView
                {...{
                    ...defaultProps,
                    currentHelpdeskPlan: basicMonthlyHelpdeskPlan,
                    currentAutomatePlan: undefined,
                    isCurrentSubscriptionCanceled: true,
                }}
            />,
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
                'Your subscription is cancelled. To reactivate, please',
                { exact: false },
            ),
        )
    })
})
