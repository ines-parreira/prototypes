import React from 'react'
import {fireEvent, render, act} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {shopifyIntegration} from 'fixtures/integrations'

import {ShopifyIntegration} from 'models/integration/types'
import ToolbarProvider from '../../ToolbarProvider'
import AddDiscountCode from '../AddDiscountCode'

const minProps = {
    getEditorState: jest.fn(),
    setEditorState: jest.fn(),
}

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('<AddDiscountCode/>', () => {
    let store = mockStore({})
    beforeEach(() => {
        store = mockStore({})
    })

    it('should not render when the popover is closed', () => {
        const {container} = render(<AddDiscountCode {...minProps} />, {
            container: document.body,
        })
        expect(container).toMatchSnapshot()
    })

    it('should render the discount picker when the popover is clicked and only one integration', () => {
        const {getByText, container} = render(
            <Provider store={store}>
                <ToolbarProvider
                    shopifyIntegrations={fromJS([shopifyIntegration])}
                >
                    <AddDiscountCode {...minProps} />
                </ToolbarProvider>
            </Provider>,
            {
                container: document.body,
            }
        )
        act(() => {
            fireEvent.click(getByText(/discount/i))
        })
        expect(container).toMatchSnapshot()
    })

    it('should render the discount picker when there is a current shopify integration', () => {
        const {getByText, container} = render(
            <Provider store={store}>
                <ToolbarProvider
                    shopifyIntegrations={fromJS([
                        shopifyIntegration,
                        shopifyIntegration,
                    ])}
                    currentShopifyIntegration={
                        shopifyIntegration as ShopifyIntegration
                    }
                >
                    <AddDiscountCode {...minProps} />
                </ToolbarProvider>
            </Provider>,
            {
                container: document.body,
            }
        )
        act(() => {
            fireEvent.click(getByText(/discount/i))
        })
        expect(container).toMatchSnapshot()
    })

    it('should render the store picker because of multiple integrations', () => {
        const {getByText, container} = render(
            <Provider store={store}>
                <ToolbarProvider
                    shopifyIntegrations={fromJS([
                        shopifyIntegration,
                        shopifyIntegration,
                    ])}
                >
                    <AddDiscountCode {...minProps} />
                </ToolbarProvider>
            </Provider>,
            {
                container: document.body,
            }
        )
        act(() => {
            fireEvent.click(getByText(/discount/i))
        })
        expect(container).toMatchSnapshot()
    })
})
