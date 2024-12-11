import {fireEvent, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'

import {UserRole} from 'config/types/user'
import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {convertAvailablePlans} from 'fixtures/productPrices'
import {ProductType} from 'models/billing/types'
import SubscriptionModal from 'pages/settings/new_billing/components/SubscriptionModal/SubscriptionModal'
import {RootState} from 'state/types'
import {renderWithStoreAndQueryClientProvider} from 'tests/renderWithStoreAndQueryClientProvider'

describe('SubscriptionModal', () => {
    const canduId = 'my-test-candu-id'
    const confirmLabel = 'Subscribe right now'
    const headerDescription = 'Test header'
    const currentPage = '/app/test-page'

    const defaultState: Partial<RootState> = {
        currentUser: fromJS({
            role: {name: UserRole.Admin},
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
            <SubscriptionModal {...minProps} isOpen={false} />,
            defaultState
        )

        expect(screen.queryByText(headerDescription)).not.toBeInTheDocument()
        expect(screen.queryByText(confirmLabel)).not.toBeInTheDocument()
    })

    it('should render', () => {
        const onClose = jest.fn()

        renderWithStoreAndQueryClientProvider(
            <SubscriptionModal {...minProps} isOpen={true} onClose={onClose} />,
            defaultState
        )

        expect(screen.getByText(headerDescription)).toBeInTheDocument()
        expect(screen.getByText(confirmLabel)).toBeInTheDocument()

        const canduDataId = document.querySelector(
            `[data-candu-id="${canduId}"]`
        )
        expect(canduDataId).not.toBeNull()

        const closeButton = document.querySelector('[aria-label="Close"]')
        expect(closeButton).not.toBeNull()
        // @ts-ignore: Button is asserted to not be null
        fireEvent.click(closeButton)

        expect(onClose).toHaveBeenCalled()
    })
})
