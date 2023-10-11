import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import _cloneDeep from 'lodash/cloneDeep'
import * as convertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import {NavbarLinkProps} from 'pages/common/components/navbar/NavbarLink'
import {AccountFeature} from 'state/currentAccount/types'
import {RootState, StoreDispatch} from 'state/types'
import {
    basicMonthlyHelpdeskPrice,
    HELPDESK_PRODUCT_ID,
    products,
    proMonthlyHelpdeskPrice,
    starterHelpdeskPrice,
} from 'fixtures/productPrices'
import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {HelpdeskPrice} from 'models/billing/types'
import ConvertStatsNavbar from '../ConvertStatsNavbar'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
jest.mock(
    'pages/settings/new_billing/components/ConvertSubscriptionModal',
    () => {
        return jest.fn(() => {
            return <div data-testid="mock-convert-subscription-modal" />
        })
    }
)

describe('ConvertStatsNavbar', () => {
    const getState = (price: HelpdeskPrice, enabled = false): RootState => {
        const productsWithStarter = _cloneDeep(products)
        productsWithStarter[0].prices.push(price)

        return {
            billing: fromJS({...billingState, products: productsWithStarter}),
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    ...account.current_subscription,
                    products: {
                        [HELPDESK_PRODUCT_ID]: price.price_id,
                    },
                },
                features: {
                    [AccountFeature.RevenueStatistics]: {
                        enabled: enabled,
                    },
                },
            }),
        } as RootState
    }

    const defaultState = getState(basicMonthlyHelpdeskPrice)

    const COMMON_NAV_LINK_PROPS: Partial<NavbarLinkProps> = {
        exact: true,
    }

    beforeEach(() => {
        jest.spyOn(
            convertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => false)
    })

    it('should render regular links for Convert subscriber and Pro plan', () => {
        const mockedState = getState(proMonthlyHelpdeskPrice, true)

        jest.spyOn(
            convertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)

        const {queryByTestId} = render(
            <Provider store={mockStore(mockedState)}>
                <ConvertStatsNavbar
                    commonNavLinkProps={COMMON_NAV_LINK_PROPS}
                />
            </Provider>
        )

        const iconElement = screen.queryByText('arrow_circle_up')
        expect(iconElement).toBeNull()

        const mockModal = queryByTestId('mock-convert-subscription-modal')
        expect(mockModal).not.toBeInTheDocument()

        const links = document.getElementsByClassName('link-wrapper')
        expect(links.length).toBe(2)
    })

    it('should render links with subscription upgrade icon and modal', () => {
        const {getByTestId} = render(
            <Provider store={mockStore(defaultState)}>
                <ConvertStatsNavbar
                    commonNavLinkProps={COMMON_NAV_LINK_PROPS}
                />
            </Provider>
        )

        const iconElement = screen.queryByText('arrow_circle_up')
        expect(iconElement).toBeInTheDocument()

        const overviewLink = screen.queryByText('Overview')
        expect(overviewLink).not.toBeInTheDocument()

        const mockModal = getByTestId('mock-convert-subscription-modal')
        expect(mockModal).toBeInTheDocument()
    })

    it('should render links with subscription upgrade for starter plan', () => {
        const mockedState = getState(starterHelpdeskPrice)

        const {queryByTestId} = render(
            <Provider store={mockStore(mockedState)}>
                <ConvertStatsNavbar
                    commonNavLinkProps={COMMON_NAV_LINK_PROPS}
                />
            </Provider>
        )

        const iconElement = screen.queryByText('arrow_circle_up')
        expect(iconElement).toBeInTheDocument()

        const mockModal = queryByTestId('mock-convert-subscription-modal')
        expect(mockModal).not.toBeInTheDocument()
    })
})
