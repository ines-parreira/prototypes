import React from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import type { MockStoreEnhanced } from 'redux-mock-store'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { RootState, StoreDispatch } from 'state/types'

import FacebookIntegrationLoginButton from '../FacebookIntegrationLoginButton'

describe('FacebookIntegrationLoginButton component', () => {
    let store: MockStoreEnhanced

    beforeEach(() => {
        const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>(
            [thunk],
        )

        store = mockStore({
            integrations: fromJS({
                authentication: {
                    facebook: {
                        redirect_uri_reconnect: 'https://.../?reconnect',
                        redirect_uri: 'https://.../',
                    },
                },
            }),
        })
    })

    it('should render a log in link', () => {
        render(
            <Provider store={store}>
                <FacebookIntegrationLoginButton link />
            </Provider>,
        )

        expect(screen.getByRole('link'))
    })

    it('should render a reconnect button', () => {
        render(
            <Provider store={store}>
                <FacebookIntegrationLoginButton reconnect />
            </Provider>,
        )

        expect(screen.getByRole('button'))
    })
})
