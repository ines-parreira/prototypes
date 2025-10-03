import { userEvent } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import _cloneDeep from 'lodash/cloneDeep'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { Navigation } from 'components/Navigation/Navigation'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    basicMonthlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
    products,
    proMonthlyHelpdeskPlan,
} from 'fixtures/productPrices'
import * as aiAgentAccessHook from 'hooks/aiAgent/useAiAgentAccess'
import { HelpdeskPlan, Product, ProductType } from 'models/billing/types'
import * as convertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import { AccountFeature } from 'state/currentAccount/types'
import { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import { ConvertStatsNavbar } from '../ConvertStatsNavbar'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
jest.mock('pages/convert/common/components/ConvertSubscriptionModal', () => {
    return jest.fn(() => {
        return <div data-testid="mock-convert-subscription-modal" />
    })
})

describe('ConvertStatsNavbar', () => {
    const getState = (price: HelpdeskPlan, enabled = false): RootState => {
        const productsWithStarter = _cloneDeep(products)
        const helpdeskProduct =
            productsWithStarter[0] as Product<ProductType.Helpdesk>
        helpdeskProduct.prices.push(price)

        return {
            billing: fromJS({ ...billingState, products: productsWithStarter }),
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

    const defaultState = getState(basicMonthlyHelpdeskPlan)

    beforeEach(() => {
        jest.spyOn(
            convertSubscriberHook,
            'useIsConvertSubscriber',
        ).mockImplementation(() => false)
        jest.spyOn(aiAgentAccessHook, 'useAiAgentAccess').mockImplementation(
            () => ({
                hasAccess: false,
                isLoading: false,
            }),
        )
    })

    it('should render regular links for Convert subscriber and Pro plan', () => {
        const mockedState = getState(proMonthlyHelpdeskPlan, true)

        jest.spyOn(
            convertSubscriberHook,
            'useIsConvertSubscriber',
        ).mockImplementation(() => true)

        const { queryByTestId, getByRole } = renderWithRouter(
            <Provider store={mockStore(mockedState)}>
                <Navigation.Root>
                    <ConvertStatsNavbar />
                </Navigation.Root>
            </Provider>,
        )

        userEvent.click(getByRole('button', { name: /Convert/i }))

        const iconElement = screen.queryByText('arrow_circle_up')
        expect(iconElement).toBeNull()

        const mockModal = queryByTestId('mock-convert-subscription-modal')
        expect(mockModal).not.toBeInTheDocument()

        const links = screen.getAllByRole('link')
        expect(links.length).toBe(1)
    })

    it('should render links with subscription upgrade icon and modal', () => {
        const { getByTestId, getByRole } = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <Navigation.Root>
                    <ConvertStatsNavbar />
                </Navigation.Root>
            </Provider>,
        )

        userEvent.click(getByRole('button', { name: /Convert/i }))

        const iconElement = screen.queryByText('arrow_circle_up')
        expect(iconElement).toBeInTheDocument()

        const campaignsLink = screen.queryByText('Campaigns')
        expect(campaignsLink).toBeInTheDocument()

        const overviewLink = screen.queryByText('Overview')
        expect(overviewLink).not.toBeInTheDocument()

        const mockModal = getByTestId('mock-convert-subscription-modal')
        expect(mockModal).toBeInTheDocument()
    })
})
