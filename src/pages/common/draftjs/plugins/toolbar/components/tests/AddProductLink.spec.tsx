import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {List} from 'immutable'

import AddProductLink from '../AddProductLink'
import {integrationsStateWithShopify} from '../../../../../../../fixtures/integrations'

const minProps = {
    integrations: integrationsStateWithShopify.get('integrations') as List<any>,
    getEditorState: jest.fn(),
    setEditorState: jest.fn(),
}

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('<AddProductLink/>', () => {
    let store = mockStore({})
    beforeEach(() => {
        jest.clearAllMocks()
        store = mockStore({})
    })

    it('should not render when the popover is closed', () => {
        const {container} = render(<AddProductLink {...minProps} />)
        expect(container).toMatchSnapshot()
    })

    it('should render the product picker when the popover is clicked and only one integration', () => {
        const {getByText, container} = render(
            <Provider store={store}>
                <AddProductLink {...minProps} />
            </Provider>
        )
        fireEvent.click(getByText(/shopify/i))
        expect(container).toMatchSnapshot()
    })

    it('should render the store picker because of multiple integrations', () => {
        let integrations = integrationsStateWithShopify.get(
            'integrations'
        ) as List<any>
        integrations = integrations.push(integrations.toArray()[0])
        const {getByText, container} = render(
            <AddProductLink
                integrations={integrations}
                getEditorState={minProps.getEditorState}
                setEditorState={minProps.setEditorState}
            />
        )
        fireEvent.click(getByText(/shopify/i))
        expect(container).toMatchSnapshot()
    })
})
