import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {fireEvent} from '@testing-library/react'

import {renderWithRouter} from '../../../../../../utils/testing'
import ShopifyIntegrationList from '../ShopifyIntegrationList.js'

describe('ShopifyIntegrationList', () => {
    const store = configureMockStore([thunk])({})
    const commonProps = {
        actions: {
            activateIntegration: jest.fn(),
            deactivateIntegration: jest.fn(),
            deleteIntegration: jest.fn(),
        },
        integrations: fromJS([]),
        loading: fromJS({}),
        redirectUri: 'gorgias.io',
    }

    it('should open the Shopify store page when clicking the "Add" button', () => {
        const {getByText} = renderWithRouter(
            <Provider store={store}>
                <ShopifyIntegrationList {...commonProps} />
            </Provider>
        )

        window.open = jest.fn()
        fireEvent.click(getByText('Add Shopify'))

        expect(window.open).toHaveBeenCalledWith(
            'https://apps.shopify.com/helpdesk'
        )
    })
})
