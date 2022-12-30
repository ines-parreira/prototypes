import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import {Provider} from 'react-redux'
import {RootState, StoreDispatch} from 'state/types'

import FacebookIntegrationLoginButton from '../FacebookIntegrationLoginButton'

describe('FacebookIntegrationLoginButton component', () => {
    let store: MockStoreEnhanced

    beforeEach(() => {
        const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>(
            [thunk]
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
        const component = mount(
            <Provider store={store}>
                <FacebookIntegrationLoginButton link />
            </Provider>
        )

        expect(component).toMatchSnapshot()
    })

    it('should render a reconnect button', () => {
        const component = mount(
            <Provider store={store}>
                <FacebookIntegrationLoginButton reconnect />
            </Provider>
        )

        expect(component).toMatchSnapshot()
    })
})
