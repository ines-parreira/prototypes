import {fireEvent, render} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import SubscriptionModal from 'pages/settings/new_billing/components/SubscriptionModal/SubscriptionModal'
import {ProductType} from 'models/billing/types'
import {convertProduct} from 'fixtures/productPrices'
import {mockStore} from 'utils/testing'
import {UserRole} from 'config/types/user'
import {RootState} from 'state/types'
import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'

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
        prices: convertProduct.prices,
        tagline: '',
        confirmLabel: confirmLabel,
        headerDescription: headerDescription,
        currentPage: currentPage,
        defaultPrice: convertProduct.prices[0],
        isTrialingSubscription: false,
        isOpen: false,
        onClose: jest.fn(),
        onSubscribe: jest.fn(),
    }

    it('should not render', () => {
        const {queryByText} = render(
            <Provider store={mockStore(defaultState as any)}>
                <SubscriptionModal {...minProps} isOpen={false} />
            </Provider>
        )

        expect(queryByText(headerDescription)).not.toBeInTheDocument()
        expect(queryByText(confirmLabel)).not.toBeInTheDocument()
    })

    it('should render', () => {
        const onClose = jest.fn()

        const {getByText} = render(
            <Provider store={mockStore(defaultState as any)}>
                <SubscriptionModal
                    {...minProps}
                    isOpen={true}
                    onClose={onClose}
                />
            </Provider>
        )

        expect(getByText(headerDescription)).toBeInTheDocument()
        expect(getByText(confirmLabel)).toBeInTheDocument()

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
