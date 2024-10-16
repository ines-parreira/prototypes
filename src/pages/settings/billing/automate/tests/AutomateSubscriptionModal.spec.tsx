import React, {ComponentProps} from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {UserRole} from 'config/types/user'
import {account, automationSubscriptionProductPrices} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {RootState, StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'
import {SegmentEvent, logEvent} from 'common/segment'

import AutomateSubscriptionModal from '../AutomateSubscriptionModal'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
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

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

const minProps: ComponentProps<typeof AutomateSubscriptionModal> = {
    confirmLabel: 'I am sure',
    isOpen: false,
    onClose: jest.fn(),
}

describe('<AutomateSubscriptionModal />', () => {
    it('should not render the modal', () => {
        const {baseElement} = render(
            <Provider store={mockStore(defaultState)}>
                <AutomateSubscriptionModal {...minProps} />
            </Provider>
        )
        expect(logEventMock).not.toHaveBeenCalled()
        expect(baseElement).toMatchSnapshot()
    })

    it('should render the modal', () => {
        const {baseElement} = render(
            <Provider store={mockStore(defaultState)}>
                <AutomateSubscriptionModal {...minProps} isOpen />
            </Provider>
        )
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AutomatePaywallModalUpsell,
            {location: undefined}
        )
        expect(baseElement).toMatchSnapshot()
    })

    it('should display loader', async () => {
        const {findByText} = render(
            <Provider store={mockStore(defaultState)}>
                {' '}
                <AutomateSubscriptionModal {...minProps} isOpen />
            </Provider>
        )
        const button = await findByText(/I am sure/)
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AutomatePaywallModalUpsell,
            {location: undefined}
        )
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
                <AutomateSubscriptionModal {...minProps} isOpen />
            </Provider>
        )
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AutomatePaywallModalUpsell,
            {location: undefined}
        )
        await findByText(/Cancel subscription/i)
        expect(baseElement).toMatchSnapshot()
    })

    it('should display image', async () => {
        const {findByAltText} = render(
            <Provider store={mockStore(defaultState)}>
                {' '}
                <AutomateSubscriptionModal
                    {...minProps}
                    isOpen
                    image="foo.png"
                />
            </Provider>
        )
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AutomatePaywallModalUpsell,
            {location: undefined}
        )
        const img = await findByAltText(/features/)
        expect(img).toMatchSnapshot()
    })

    it('should display the new modal description component', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <AutomateSubscriptionModal {...minProps} isOpen />
            </Provider>
        )

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AutomatePaywallModalUpsell,
            {location: undefined}
        )
        expect(
            screen.getByText(`Ready to upgrade with Automate?`)
        ).toBeInTheDocument()
    })
})
