import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicYearlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
    legacyAutomatePlan,
    SMS_PRODUCT_ID,
    starterHelpdeskPlan,
    VOICE_PRODUCT_ID,
    voicePlan1,
} from 'fixtures/productPrices'
import { Cadence } from 'models/billing/types'
import { getCadenceName } from 'models/billing/utils'
import { TicketPurpose } from 'state/billing/types'
import { StoreState } from 'state/types'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import NavigateToChangeBillingFrequency, {
    NavigateToChangeBillingFrequencyProps,
} from '../NavigateToChangeBillingFrequency'

import css from './NavigateToChangeBillingFrequency.less'

const store: Partial<StoreState> = {
    billing: fromJS(billingState),
    currentAccount: fromJS(account),
}

const contactBillingMock = jest.fn()
const props: NavigateToChangeBillingFrequencyProps = {
    buttonText: 'Change Frequency',
    tooltipPlacement: 'top',
    contactBilling: contactBillingMock,
}

describe('NavigateToChangeBillingFrequency', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the correct button text', () => {
        renderWithStoreAndQueryClientProvider(
            <NavigateToChangeBillingFrequency {...props} />,
            store,
        )

        expect(screen.getByText('Change Frequency')).toBeInTheDocument()
    })

    it('should tell the user to upgrade if on a starter helpdesk plan', async () => {
        renderWithStoreAndQueryClientProvider(
            <NavigateToChangeBillingFrequency {...props} />,
            {
                ...store,
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        products: {
                            ...account.current_subscription.products,
                            [HELPDESK_PRODUCT_ID]: starterHelpdeskPlan.price_id,
                        },
                    },
                }),
            },
        )

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
        renderWithStoreAndQueryClientProvider(
            <NavigateToChangeBillingFrequency {...props} />,
            {
                ...store,
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        products: {
                            ...account.current_subscription.products,
                            [AUTOMATION_PRODUCT_ID]:
                                legacyAutomatePlan.price_id,
                        },
                    },
                }),
            },
        )

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
        renderWithStoreAndQueryClientProvider(
            <NavigateToChangeBillingFrequency {...props} />,
            {
                ...store,
                currentAccount: fromJS({
                    ...account,
                    current_subscription: null,
                }),
            },
        )

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

    it('should tell the user to contact us if their subscription is scheduled to cancel', async () => {
        renderWithStoreAndQueryClientProvider(
            <NavigateToChangeBillingFrequency {...props} />,
            {
                ...store,
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        scheduled_to_cancel_at: '2017-09-23T01:38:53+00:00',
                    },
                }),
            },
        )

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

    it('should tell the user to contact us if they are not vetted for phone', async () => {
        renderWithStoreAndQueryClientProvider(
            <NavigateToChangeBillingFrequency {...props} />,
            {
                ...store,
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        products: {
                            ...account.current_subscription.products,
                            [VOICE_PRODUCT_ID]: voicePlan1.plan_id,
                            [SMS_PRODUCT_ID]: undefined,
                        },
                    },
                }),
            },
        )

        const button = screen.getByText('Change Frequency')
        expect(button).toBeInTheDocument()
        expect(button).toHaveClass(css.disabledText)
        await act(() => userEvent.hover(button))

        const tooltip = screen.getByRole('tooltip')
        expect(tooltip).toBeInTheDocument()
        expect(tooltip).toHaveTextContent(
            `To switch from ${getCadenceName(Cadence.Month)} to ${getCadenceName(Cadence.Year)} billing, please `,
        )

        const contact = screen.getByText('get in touch')
        await act(() => userEvent.click(contact))
        expect(contactBillingMock).toHaveBeenCalledWith(
            TicketPurpose.MONTHLY_TO_YEARLY,
        )
    })

    it('should tell the user to contact us when downgrading billing frequency', async () => {
        renderWithStoreAndQueryClientProvider(
            <NavigateToChangeBillingFrequency {...props} />,
            {
                ...store,
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        products: {
                            ...account.current_subscription.products,
                            [HELPDESK_PRODUCT_ID]:
                                basicYearlyHelpdeskPlan.price_id,
                        },
                    },
                }),
            },
        )

        const button = screen.getByText('Change Frequency')
        expect(button).toBeInTheDocument()
        expect(button).toHaveClass(css.disabledText)
        await act(() => userEvent.hover(button))

        const tooltip = screen.getByRole('tooltip')
        expect(tooltip).toBeInTheDocument()
        expect(tooltip).toHaveTextContent(
            `To switch from ${getCadenceName(Cadence.Year)} to ${getCadenceName(Cadence.Month)} billing, please `,
        )

        const contact = screen.getByText('get in touch')
        await act(() => userEvent.click(contact))
        expect(contactBillingMock).toHaveBeenCalledWith(
            TicketPurpose.CONTACT_US,
        )
    })
})
