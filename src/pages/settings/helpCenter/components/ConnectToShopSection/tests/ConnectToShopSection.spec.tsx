import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {act, fireEvent, render, waitFor} from '@testing-library/react'

import {fromJS} from 'immutable'

import {initialState as articlesState} from '../../../../../../state/helpCenter/articles/reducer'
import {initialState as categoriesState} from '../../../../../../state/helpCenter/categories/reducer'
import {initialState as uiState} from '../../../../../../state/helpCenter/ui/reducer'
import {RootState, StoreDispatch} from '../../../../../../state/types'
import {getHelpCentersResponseFixture} from '../../../fixtures/getHelpCentersResponse.fixture'
import {ConnectToShopSection} from '../ConnectToShopSection'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const defaultState: Partial<RootState> = {
    entities: {
        helpCenters: {
            '1': getHelpCentersResponseFixture.data[0],
        },
    } as any,
    helpCenter: {
        ui: {...uiState, currentId: 1},
        articles: articlesState,
        categories: categoriesState,
    },
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
    })

    it('renders in disabled state while fetching data', async () => {
        const onUpdate = jest.fn()

        const {
            container,
            getAllByText,
            getByText,
        } = render(
            <ConnectToShopSection
                helpCenter={getHelpCentersResponseFixture.data[0]}
                onUpdate={onUpdate}
            />,
            {wrapper: ReduxProvider}
        )

        expect(container).toMatchSnapshot()

        act(() => {
            fireEvent.click(getAllByText('Connect')[0])
        })

        await waitFor(() => getByText('Select store'))

        act(() => {
            fireEvent.click(getByText('Select store'))
        })

        await waitFor(() => getByText('meow-shop'))

        getByText('1 connected chat')

        act(() => {
            fireEvent.click(getByText('meow-shop'))
        })

        act(() => {
            fireEvent.click(getAllByText('Connect')[1])
        })

        expect(onUpdate).toBeCalledWith({shop_name: 'meow-shop'})
    })
})
