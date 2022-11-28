import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'

import _cloneDeep from 'lodash/cloneDeep'
import {billingState} from 'fixtures/billing'
import {
    HELPDESK_PRODUCT_ID,
    legacyBasicHelpdeskPrice,
    products,
} from 'fixtures/productPrices'
import {PlanName} from 'utils/paywalls'
import {RootState, StoreDispatch} from 'state/types'

import HelpCenterPaywall from '../HelpCenterPaywall'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
let mockedOpenChat: typeof jest.fn
jest.mock('../../../../../../utils', () => {
    const mock = {
        ...jest.requireActual('../../../../../../utils'),
        openChat: jest.fn(),
    } as Record<string, any>

    mockedOpenChat = mock.openChat
    return mock
})

const createProductPricesWithLegacyPrice = (name: PlanName) => {
    const productsWithLegacyPrice = _cloneDeep(products)
    productsWithLegacyPrice[0].prices.push({
        ...legacyBasicHelpdeskPrice,
        price_id: 'legacyPlan',
        name,
    })

    return productsWithLegacyPrice
}

describe('HelpCenterPaywall', () => {
    it('should render the component correctly for when the plan is unavailable', () => {
        const state: Partial<RootState> = {
            billing: fromJS(billingState),
            currentAccount: fromJS({
                current_subscription: {
                    products: {},
                },
            }),
        }

        const {container} = render(
            <Provider store={mockStore(state)}>
                <HelpCenterPaywall />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render the component correctly for "Basic" legacy plan', () => {
        const productsWithLegacyPrice = _cloneDeep(products)
        productsWithLegacyPrice[0].prices.push(legacyBasicHelpdeskPrice)

        const state: Partial<RootState> = {
            currentAccount: fromJS({
                current_subscription: {
                    products: {
                        [HELPDESK_PRODUCT_ID]:
                            legacyBasicHelpdeskPrice.price_id,
                    },
                },
            }),
            billing: fromJS({
                ...billingState,
                products: productsWithLegacyPrice,
            }),
        }

        const {container} = render(
            <Provider store={mockStore(state)}>
                <HelpCenterPaywall />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render the component correctly "for" Pro legacy plan', () => {
        const state: Partial<RootState> = {
            currentAccount: fromJS({
                current_subscription: {
                    products: {
                        [HELPDESK_PRODUCT_ID]: 'legacyPlan',
                    },
                },
            }),
            billing: fromJS({
                ...billingState,
                products: createProductPricesWithLegacyPrice(PlanName.Pro),
            }),
        }
        const {container} = render(
            <Provider store={mockStore(state)}>
                <HelpCenterPaywall />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render the component correctly for "Advanced" legacy plan', () => {
        const state: Partial<RootState> = {
            currentAccount: fromJS({
                current_subscription: {
                    products: {
                        [HELPDESK_PRODUCT_ID]: 'legacyPlan',
                    },
                },
            }),
            billing: fromJS({
                ...billingState,
                products: createProductPricesWithLegacyPrice(PlanName.Advanced),
            }),
        }
        const {container} = render(
            <Provider store={mockStore(state)}>
                <HelpCenterPaywall />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render the component correctly for "Enterprise" legacy plan', () => {
        const state: Partial<RootState> = {
            currentAccount: fromJS({
                current_subscription: {
                    products: {
                        [HELPDESK_PRODUCT_ID]: 'legacyPlan',
                    },
                },
            }),
            billing: fromJS({
                ...billingState,
                products: createProductPricesWithLegacyPrice(
                    PlanName.Enterprise
                ),
            }),
        }
        const {container} = render(
            <Provider store={mockStore(state)}>
                <HelpCenterPaywall />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should open the chat when clicking on "Contact us" button', async () => {
        const state: Partial<RootState> = {
            currentAccount: fromJS({
                current_subscription: {
                    products: {
                        [HELPDESK_PRODUCT_ID]: 'legacyPlan',
                    },
                },
            }),
            billing: fromJS({
                ...billingState,
                products: createProductPricesWithLegacyPrice(
                    PlanName.Enterprise
                ),
            }),
        }
        const {findByRole} = render(
            <Provider store={mockStore(state)}>
                <HelpCenterPaywall />
            </Provider>
        )

        const contactUsButton = await findByRole('button', {
            name: /contact us/i,
        })

        fireEvent.click(contactUsButton)

        expect(mockedOpenChat).toHaveBeenCalledTimes(1)
    })

    it('should suggest the proper price when clicking the upgrade cta', () => {
        const state: Partial<RootState> = {
            currentAccount: fromJS({
                current_subscription: {
                    products: {
                        [HELPDESK_PRODUCT_ID]: 'legacyPlan',
                    },
                },
            }),
            billing: fromJS({
                ...billingState,
                products: createProductPricesWithLegacyPrice(PlanName.Advanced),
            }),
        }
        const {getByText} = render(
            <Provider store={mockStore(state)}>
                <HelpCenterPaywall />
            </Provider>
        )

        fireEvent.click(getByText(/Upgrade your plan/i))

        expect(
            getByText(/Advanced/i, {selector: '.greenTheme div'})
        ).toBeTruthy()
    })
})
