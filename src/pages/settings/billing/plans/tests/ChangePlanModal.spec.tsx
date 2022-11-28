import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import userEvent from '@testing-library/user-event'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {
    AUTOMATION_PRODUCT_ID,
    HELPDESK_PRODUCT_ID,
    legacyBasicAutomationPrice,
    legacyBasicHelpdeskPrice,
} from 'fixtures/productPrices'
import {RootState, StoreDispatch} from 'state/types'
import {account, automationSubscriptionProductPrices} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import SynchronizedScrollTopContainer from 'pages/common/components/SynchronizedScrollTop/SynchronizedScrollTopContainer'

import ChangePlanModal from '../ChangePlanModal'
import BillingPlanCard from '../BillingPlanCard'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock(
    '../BillingPlanCard',
    () =>
        ({
            amount,
            currency,
            features,
            interval,
            name,
            theme,
            renderBody,
            className,
            footer,
        }: ComponentProps<typeof BillingPlanCard>) =>
            (
                <div>
                    BillingPlanCard mock,
                    <div>theme: {theme}</div>
                    <div>
                        renderBody: {renderBody?.(<span>features mock</span>)}
                    </div>
                    <div>className: {className}</div>
                    <div>amount: {amount}</div>
                    <div>currency: {currency}</div>
                    <div>interval: {interval}</div>
                    <div>name: {name}</div>
                    <div>features: {features.toString()}</div>
                    {footer}
                </div>
            )
)

jest.mock(
    'pages/common/components/SynchronizedScrollTop/SynchronizedScrollTopContainer',
    () =>
        ({height}: ComponentProps<typeof SynchronizedScrollTopContainer>) =>
            (
                <div>
                    SynchronizedScrollTopContainer mock,
                    <div>height: {height}</div>
                </div>
            )
)

describe('<ChangePlanModal />', () => {
    const minProps: ComponentProps<typeof ChangePlanModal> = {
        confirmLabel: 'Confirm',
        description: 'description of the plan change',
        header: 'Title of modal',
        isOpen: true,
        isUpdating: false,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
        renderComparedPlan: () => <div>renderComparedPlan</div>,
    }

    const defaultState: Partial<RootState> = {
        currentAccount: fromJS({
            ...account,
            current_subscription: {
                ...account.current_subscription,
            },
        }),
        billing: fromJS(billingState),
    }

    it('should not render the modal', () => {
        const {baseElement} = render(
            <Provider store={mockStore(defaultState)}>
                <ChangePlanModal {...minProps} isOpen={false} />
            </Provider>
        )
        expect(baseElement).toMatchSnapshot()
    })

    it('should render', () => {
        const {baseElement} = render(
            <Provider store={mockStore(defaultState)}>
                <ChangePlanModal {...minProps} />
            </Provider>
        )

        expect(baseElement).toMatchSnapshot()
    })

    it('should render the automation plan features for the current automation plan', () => {
        const {baseElement} = render(
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
                <ChangePlanModal {...minProps} />
            </Provider>
        )

        expect(baseElement).toMatchSnapshot()
    })

    it('should call onConfirm callback when clicking on button', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <ChangePlanModal {...minProps} />
            </Provider>
        )

        userEvent.click(getByText('Confirm'))
        expect(minProps.onConfirm).toHaveBeenCalled()
    })

    it('should display only compared plan when there is no current price', () => {
        const {baseElement} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: defaultState.currentAccount?.setIn(
                        ['current_subscription', 'products'],
                        fromJS({})
                    ),
                })}
            >
                <ChangePlanModal {...minProps} />
            </Provider>
        )

        expect(baseElement).toMatchSnapshot()
    })

    it('should render a discount when discounted prices', () => {
        const {baseElement} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    billing: defaultState.billing
                        ?.mergeIn(
                            ['products', 0, 'prices'],
                            fromJS([legacyBasicHelpdeskPrice])
                        )
                        ?.mergeIn(
                            ['products', 1, 'prices'],
                            fromJS([legacyBasicAutomationPrice])
                        ),
                    currentAccount: defaultState.billing?.setIn(
                        ['current_subscription', 'products'],
                        fromJS({
                            [HELPDESK_PRODUCT_ID]:
                                legacyBasicHelpdeskPrice.price_id,
                            [AUTOMATION_PRODUCT_ID]:
                                legacyBasicAutomationPrice.price_id,
                        })
                    ),
                })}
            >
                <ChangePlanModal {...minProps} />
            </Provider>
        )

        expect(baseElement).toMatchSnapshot()
    })
})
