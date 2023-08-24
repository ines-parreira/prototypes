import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import {List} from 'immutable'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {integrationsStateWithShopify} from 'fixtures/integrations'

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
        const {container} = render(<AddDiscountCode {...minProps} />)
        expect(container).toMatchSnapshot()
    })

    it('should render the discount picker when the popover is clicked and only one integration', () => {
        const {getByText, container} = render(
            <Provider store={store}>
                <ToolbarProvider
                    shopifyIntegrations={
                        integrationsStateWithShopify.get(
                            'integrations'
                        ) as List<any>
                    }
                >
                    <AddDiscountCode {...minProps} />
                </ToolbarProvider>
            </Provider>
        )
        fireEvent.click(getByText(/discount/i))
        expect(container).toMatchSnapshot()
    })

    it('should render the store picker because of multiple integrations', () => {
        let integrations = integrationsStateWithShopify.get(
            'integrations'
        ) as List<any>
        integrations = integrations.push(integrations.toArray()[0])
        const {getByText, container} = render(
            <Provider store={store}>
                <ToolbarProvider shopifyIntegrations={integrations}>
                    <AddDiscountCode {...minProps} />
                </ToolbarProvider>
            </Provider>
        )
        fireEvent.click(getByText(/discount/i))
        expect(container).toMatchSnapshot()
    })
})
