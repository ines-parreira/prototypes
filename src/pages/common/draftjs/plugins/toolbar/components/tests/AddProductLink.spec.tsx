import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import {List} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {integrationsStateWithShopify} from 'fixtures/integrations'
import * as ToolbarContext from '../../ToolbarContext'
import ToolbarProvider from '../../ToolbarProvider'
import AddProductLink from '../AddProductLink'

const minProps = {
    getEditorState: jest.fn(),
    setEditorState: jest.fn(),
}

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('<AddProductLink/>', () => {
    let store = mockStore({})
    beforeEach(() => {
        store = mockStore({})
    })

    it('should not render when the popover is closed', () => {
        const {container} = render(
            <Provider store={store}>
                <ToolbarProvider
                    shopifyIntegrations={
                        integrationsStateWithShopify.get(
                            'integrations'
                        ) as List<any>
                    }
                >
                    <AddProductLink {...minProps} />
                </ToolbarProvider>
            </Provider>,
            {container: document.body}
        )
        expect(container).toMatchSnapshot()
    })

    it('should render the product picker when the popover is clicked and only one integration', () => {
        const {getByText, container, unmount} = render(
            <Provider store={store}>
                <ToolbarProvider
                    shopifyIntegrations={
                        integrationsStateWithShopify.get(
                            'integrations'
                        ) as List<any>
                    }
                >
                    <AddProductLink {...minProps} />
                </ToolbarProvider>
            </Provider>,
            {container: document.body}
        )
        fireEvent.click(getByText(/shopify/i))
        expect(container).toMatchSnapshot()
        unmount()
    })

    it('should render the store picker because of multiple integrations', () => {
        let integrations = integrationsStateWithShopify.get(
            'integrations'
        ) as List<any>
        integrations = integrations.push(integrations.toArray()[0])
        const {getByText, container, unmount} = render(
            <Provider store={store}>
                <ToolbarProvider shopifyIntegrations={integrations}>
                    <AddProductLink
                        getEditorState={minProps.getEditorState}
                        setEditorState={minProps.setEditorState}
                    />
                </ToolbarProvider>
            </Provider>,
            {container: document.body}
        )
        fireEvent.click(getByText(/shopify/i))
        expect(container).toMatchSnapshot()
        unmount()
    })

    it('should render the selected integration automatically if a currentShopifyIntegration is provided', () => {
        let integrations = integrationsStateWithShopify.get(
            'integrations'
        ) as List<any>
        integrations = integrations.push(integrations.toArray()[0])
        const currentShopifyIntegration = integrations.toArray()[0]
        const originalImplementation = ToolbarContext.useToolbarContext
        const mockToolbarContext = jest.spyOn(
            ToolbarContext,
            'useToolbarContext'
        )
        mockToolbarContext.mockImplementation(() => ({
            ...originalImplementation(),
            currentShopifyIntegration,
            shopifyIntegrations: integrations,
        }))
        const {getByText} = render(
            <Provider store={store}>
                <AddProductLink
                    getEditorState={minProps.getEditorState}
                    setEditorState={minProps.setEditorState}
                />
            </Provider>
        )
        fireEvent.click(getByText(/shopify/i))

        // If the component exists, the correct page was rendered
        fireEvent.focus(getByText(/PRODUCTS/))

        mockToolbarContext.mockRestore()
    })

    it('should render the product automations when single integration and is allowed to show it', () => {
        const onAddProductAutomationAttachmentMock = jest.fn()

        const {getByText, unmount} = render(
            <Provider store={store}>
                <ToolbarProvider
                    shopifyIntegrations={
                        integrationsStateWithShopify.get(
                            'integrations'
                        ) as List<any>
                    }
                    canAddProductAutomations
                    onAddProductAutomationAttachment={
                        onAddProductAutomationAttachmentMock
                    }
                >
                    <AddProductLink {...minProps} />
                </ToolbarProvider>
            </Provider>,
            {container: document.body}
        )

        fireEvent.click(getByText(/shopify/i))
        const productRecommendation = getByText(
            'Dynamic Product Recommendation'
        )
        expect(productRecommendation).toBeInTheDocument()

        fireEvent.click(productRecommendation)
        const seenScenario = getByText('Similar Products You Have Seen')
        expect(seenScenario).toBeInTheDocument()

        fireEvent.click(seenScenario)
        expect(onAddProductAutomationAttachmentMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Similar Products You Have Seen',
            })
        )

        unmount()
    })
})
