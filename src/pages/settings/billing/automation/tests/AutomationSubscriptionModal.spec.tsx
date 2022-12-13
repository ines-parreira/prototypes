import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {UserRole} from 'config/types/user'
import {account, automationSubscriptionProductPrices} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {RootState, StoreDispatch} from 'state/types'

import AutomationSubscriptionModal from '../AutomationSubscriptionModal'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<AutomationSubscriptionModal />', () => {
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

    const minProps: ComponentProps<typeof AutomationSubscriptionModal> = {
        confirmLabel: 'I am sure',
        isOpen: false,
        onClose: jest.fn(),
    }

    it('should not render the modal', () => {
        const {baseElement} = render(
            <Provider store={mockStore(defaultState)}>
                <AutomationSubscriptionModal {...minProps} />
            </Provider>
        )
        expect(baseElement).toMatchSnapshot()
    })

    it('should render the modal', () => {
        const {baseElement} = render(
            <Provider store={mockStore(defaultState)}>
                <AutomationSubscriptionModal {...minProps} isOpen />
            </Provider>
        )
        expect(baseElement).toMatchSnapshot()
    })

    it('should display loader', async () => {
        const {findByText} = render(
            <Provider store={mockStore(defaultState)}>
                {' '}
                <AutomationSubscriptionModal {...minProps} isOpen />
            </Provider>
        )
        const button = await findByText(/I am sure/)
        fireEvent.click(button)
        expect(button).toMatchSnapshot()
    })

    it('should render for customers already with full add-on features', async () => {
        const {baseElement, findByText} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            products: automationSubscriptionProductPrices,
                        },
                    }),
                })}
            >
                <AutomationSubscriptionModal {...minProps} isOpen />
            </Provider>
        )

        await findByText(/Cancel subscription/i)
        expect(baseElement).toMatchSnapshot()
    })

    it('should display image', async () => {
        const {findByAltText} = render(
            <Provider store={mockStore(defaultState)}>
                {' '}
                <AutomationSubscriptionModal
                    {...minProps}
                    isOpen
                    image="foo.png"
                />
            </Provider>
        )
        const img = await findByAltText(/features/)
        expect(img).toMatchSnapshot()
    })
})
