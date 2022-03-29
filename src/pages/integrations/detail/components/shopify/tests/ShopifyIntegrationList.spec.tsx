import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {fireEvent} from '@testing-library/react'

import {renderWithRouter} from 'utils/testing'

import ShopifyIntegrationList from '../ShopifyIntegrationList'

describe('ShopifyIntegrationList', () => {
    const store = configureMockStore([thunk])({})
    const minProps: ComponentProps<typeof ShopifyIntegrationList> = {
        integrations: fromJS([]),
        loading: fromJS({}),
        redirectUri: 'gorgias.io',
    }

    it('should open the Shopify store page when clicking the "Add" button', () => {
        const {getByText} = renderWithRouter(
            <Provider store={store}>
                <ShopifyIntegrationList {...minProps} />
            </Provider>
        )

        window.open = jest.fn()
        fireEvent.click(getByText('Add Shopify'))

        expect(window.open).toHaveBeenCalledWith(
            'https://apps.shopify.com/helpdesk'
        )
    })
})
