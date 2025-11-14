import { act, fireEvent, render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { shopifyIntegration } from 'fixtures/integrations'

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
        const { container } = render(
            <MemoryRouter>
                <AddDiscountCode {...minProps} />
            </MemoryRouter>,
            {
                container: document.body,
            },
        )
        expect(container).toMatchSnapshot()
    })

    it('should render the discount picker when the popover is clicked and only one integration', () => {
        const { getByText, container } = render(
            <MemoryRouter>
                <Provider store={store}>
                    <ToolbarProvider
                        shopifyIntegrations={fromJS([shopifyIntegration])}
                    >
                        <AddDiscountCode {...minProps} />
                    </ToolbarProvider>
                </Provider>
            </MemoryRouter>,
            {
                container: document.body,
            },
        )
        act(() => {
            fireEvent.click(getByText(/discount/i))
        })
        expect(container).toMatchSnapshot()
    })

    it('should render the discount picker when there is a current shopify integration', () => {
        const { getByText, container } = render(
            <MemoryRouter>
                <Provider store={store}>
                    <ToolbarProvider
                        shopifyIntegrations={fromJS([
                            shopifyIntegration,
                            shopifyIntegration,
                        ])}
                        currentShopifyIntegration={shopifyIntegration}
                    >
                        <AddDiscountCode {...minProps} />
                    </ToolbarProvider>
                </Provider>
            </MemoryRouter>,
            {
                container: document.body,
            },
        )
        act(() => {
            fireEvent.click(getByText(/discount/i))
        })
        expect(container).toMatchSnapshot()
    })

    it('should render the store picker because of multiple integrations', () => {
        const { getByText, container } = render(
            <MemoryRouter>
                <Provider store={store}>
                    <ToolbarProvider
                        shopifyIntegrations={fromJS([
                            shopifyIntegration,
                            shopifyIntegration,
                        ])}
                    >
                        <AddDiscountCode {...minProps} />
                    </ToolbarProvider>
                </Provider>
            </MemoryRouter>,
            {
                container: document.body,
            },
        )
        act(() => {
            fireEvent.click(getByText(/discount/i))
        })
        expect(container).toMatchSnapshot()
    })
})
