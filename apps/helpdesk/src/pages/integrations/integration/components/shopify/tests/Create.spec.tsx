import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import Create from '../Create'

const SHOP_NAME = 'myShop'

const mockStore = configureMockStore([thunk])
const store = mockStore({
    integrations: fromJS({
        integrations: [
            {
                type: 'shopify',
                name: SHOP_NAME,
                meta: {
                    shop_name: SHOP_NAME,
                },
            },
        ],
    }),
})

const realLocation = window.location

describe('<Create/>', () => {
    afterEach(() => {
        ;(window as unknown as { location: Location }).location = realLocation
    })
    it('should render a create view', () => {
        const { container } = render(
            <Provider store={store}>
                <Create redirectUri="" />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display an error', () => {
        render(
            <Provider store={store}>
                <Create redirectUri="" />
            </Provider>,
        )

        fireEvent.change(screen.getByLabelText('Store name'), {
            target: { value: SHOP_NAME },
        })

        expect(screen.queryByText(/already an integration/)).toBeTruthy()
    })

    it('should display redirect when submitting', () => {
        Reflect.deleteProperty(window, 'location')
        Object.defineProperty(window, 'location', {
            writable: true,
            value: {
                href: 'truc',
            },
        })
        render(
            <Provider store={store}>
                <Create redirectUri="something/{shop_name}/" />
            </Provider>,
        )

        fireEvent.change(screen.getByLabelText('Store name'), {
            target: { value: 'bis' },
        })

        fireEvent.click(screen.getByRole('button'))

        expect(window.location.href).toBe(`something/bis/`)
    })
})
