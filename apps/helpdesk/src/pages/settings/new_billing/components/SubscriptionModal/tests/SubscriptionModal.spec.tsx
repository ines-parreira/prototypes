import React from 'react'

import { fireEvent, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'

import { UserRole } from 'config/types/user'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    basicYearlyInvoicedMonthlyHelpdeskPlan,
    convertAvailablePlans,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/plans'
import { ProductType } from 'models/billing/types'
import SubscriptionModal from 'pages/settings/new_billing/components/SubscriptionModal/SubscriptionModal'
import type { RootState } from 'state/types'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

describe('SubscriptionModal', () => {
    const canduId = 'my-test-candu-id'
    const confirmLabel = 'Subscribe right now'
    const headerDescription = 'Test header'
    const currentPage = '/app/test-page'

    const defaultState: Partial<RootState> = {
        currentUser: fromJS({
            role: { name: UserRole.Admin },
        }),
        currentAccount: fromJS({
            ...account,
            current_subscription: {
                ...account.current_subscription,
                status: 'active',
            },
        }),
        billing: fromJS(billingState),
    }

    const minProps = {
        productType: ProductType.Convert,
        canduId: canduId,
        availablePlans: convertAvailablePlans,
        tagline: '',
        confirmLabel: confirmLabel,
        headerDescription: headerDescription,
        currentPage: currentPage,
        defaultPlan: convertAvailablePlans[0],
        isTrialingSubscription: false,
        isOpen: false,
        onClose: jest.fn(),
        onSubscribe: jest.fn(),
    }

    it('should not render', () => {
        renderWithStoreAndQueryClientProvider(
            <SubscriptionModal
                trackingSource="test"
                {...minProps}
                isOpen={false}
            />,
            defaultState,
        )

        expect(screen.queryByText(headerDescription)).not.toBeInTheDocument()
        expect(screen.queryByText(confirmLabel)).not.toBeInTheDocument()
    })

    it('should render', () => {
        const onClose = jest.fn()

        renderWithStoreAndQueryClientProvider(
            <SubscriptionModal
                trackingSource="test"
                {...minProps}
                isOpen={true}
                onClose={onClose}
            />,
            defaultState,
        )

        expect(screen.getByText(headerDescription)).toBeInTheDocument()
        expect(screen.getByText(confirmLabel)).toBeInTheDocument()

        const canduDataId = document.querySelector(
            `[data-candu-id="${canduId}"]`,
        )
        expect(canduDataId).not.toBeNull()

        const closeButton = document.querySelector('[aria-label="Close"]')
        expect(closeButton).not.toBeNull()
        // @ts-ignore: Button is asserted to not be null
        fireEvent.click(closeButton)

        expect(onClose).toHaveBeenCalled()
    })

    it('should show custom plan message and Contact Us button for yearly contract plans', async () => {
        const confirmEnterpriseLabel = 'Contact Us'
        const yearlyPlanState: Partial<RootState> = {
            ...defaultState,
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    ...account.current_subscription,
                    products: {
                        [HELPDESK_PRODUCT_ID]:
                            basicYearlyInvoicedMonthlyHelpdeskPlan.plan_id,
                    },
                    status: 'active',
                },
            }),
            billing: fromJS({
                ...billingState,
                products: billingState.products.map((product) =>
                    product.type === 'helpdesk'
                        ? {
                              ...product,
                              prices: [
                                  ...product.prices,
                                  basicYearlyInvoicedMonthlyHelpdeskPlan,
                              ],
                          }
                        : product,
                ),
            }),
        }

        renderWithStoreAndQueryClientProvider(
            <SubscriptionModal
                trackingSource="test"
                {...minProps}
                isOpen={true}
                confirmEnterpriseLabel={confirmEnterpriseLabel}
            />,
            yearlyPlanState,
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Contact our team to subscribe to a custom plan.',
                ),
            ).toBeInTheDocument()
        })

        expect(
            screen.getByRole('button', { name: confirmEnterpriseLabel }),
        ).toBeInTheDocument()
    })
})
