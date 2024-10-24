import {act, fireEvent, render, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {IntegrationType} from 'models/integration/constants'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {initialState as articlesState} from 'state/entities/helpCenter/articles/reducer'
import {initialState as categoriesState} from 'state/entities/helpCenter/categories/reducer'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiState} from 'state/ui/helpCenter/reducer'
import {ThemeProvider} from 'theme'

import {ConnectToShopSection} from '../ConnectToShopSection'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const defaultState: Partial<RootState> = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    '1': getHelpCentersResponseFixture.data[0],
                },
            },
            articles: articlesState,
            categories: categoriesState,
        },
    } as any,
    ui: {helpCenter: {...uiState, currentId: 1}} as any,
    integrations: fromJS({
        integrations: [
            {
                meta: {
                    sync_customer_notes: true,
                    shop_id: 54899465,
                    uses_multi_currency: true,
                    shop_domain: 'gorgiastest.com',
                    currency: 'USD',
                    shop_display_name: 'Store Gorgias 3',
                    shop_plan: 'affiliate',
                    shop_name: 'meow-shop',
                    is_used_for_billing: true,
                },
                name: 'Meow shop',
                uri: '/api/integrations/1/',
                created_datetime: '2020-01-28T22:19:15.604153+00:00',
                type: 'shopify',
                id: 1,
                updated_datetime: '2020-01-28T22:19:15.604157+00:00',
            },
            {
                meta: {
                    shop_name: 'meow-shop',
                },
                name: 'Chitty chatty',
                user: {
                    id: 2,
                },
                uri: '/api/integrations/2/',
                decoration: null,
                locked_datetime: null,
                created_datetime: '2017-02-07T06:07:43.481450+00:00',
                type: 'gorgias_chat',
                id: 2,
                description: null,
                updated_datetime: '2017-02-07T06:07:43.481517+00:00',
            },
        ],
    }),
}

const store = mockStore(defaultState)

const ReduxProvider = ({children}: {children?: React.ReactNode}) => (
    <Provider store={store}>{children}</Provider>
)

describe('<ConnectToShopSection />', () => {
    beforeEach(() => {
        store.clearActions()
        mockFlags({})
    })

    it('renders in disabled state while fetching data', async () => {
        const onUpdate = jest.fn()

        const {container, getAllByText, getByText} = render(
            <ThemeProvider>
                <ConnectToShopSection
                    shopName={getHelpCentersResponseFixture.data[0].shop_name}
                    onUpdate={onUpdate}
                />
            </ThemeProvider>,
            {wrapper: ReduxProvider}
        )

        expect(container).toMatchSnapshot()

        act(() => {
            fireEvent.click(getAllByText('Connect')[0])
        })

        await waitFor(() => getAllByText('Select a store'))

        act(() => {
            fireEvent.click(getAllByText('Select a store')[0])
        })

        await waitFor(() => getByText('Meow shop'))

        getByText('1 connected chat')

        act(() => {
            fireEvent.click(getByText('Meow shop'))
        })

        act(() => {
            fireEvent.click(getAllByText('Connect Store')[0])
        })

        expect(onUpdate).toBeCalledWith({
            shop_name: 'Meow shop',
            self_service_deactivated: true,
        })
    })

    it('should display appropriate store logo when shopType is provided', () => {
        const onUpdate = jest.fn()

        const {getByText, getByAltText} = render(
            <ThemeProvider>
                <ConnectToShopSection
                    shopName={'Meow shop'}
                    shopType={IntegrationType.Shopify}
                    onUpdate={onUpdate}
                />
            </ThemeProvider>,
            {wrapper: ReduxProvider}
        )

        expect(getByText('Meow shop')).toBeInTheDocument()
        const imgElement = getByAltText('store logo')
        expect(imgElement).toBeInTheDocument()
        expect(imgElement).toHaveAttribute(
            'src',
            '/assets/img/integrations/shopify.png'
        )
    })

    it('should display a default store logo when shopType is not provided', () => {
        const onUpdate = jest.fn()

        const {getByText, getByAltText} = render(
            <ThemeProvider>
                <ConnectToShopSection
                    shopName={'Meow shop'}
                    onUpdate={onUpdate}
                />
            </ThemeProvider>,
            {wrapper: ReduxProvider}
        )

        expect(getByText('Meow shop')).toBeInTheDocument()
        const imgElement = getByAltText('store logo')
        expect(imgElement).toBeInTheDocument()
        expect(imgElement).toHaveAttribute('src', 'test-file-stub')
    })
})
