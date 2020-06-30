import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import FacebookLoginButton from '../FacebookLoginButton'

describe('FacebookLoginButton component', () => {
    let store

    beforeEach(() => {
        const middlewares = [thunk]
        const mockStore = configureMockStore(middlewares)

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
        const component = mount(<FacebookLoginButton store={store} link />)

        expect(component).toMatchSnapshot()
    })

    it('should render a reconnect button', () => {
        const component = mount(<FacebookLoginButton store={store} reconnect />)

        expect(component).toMatchSnapshot()
    })
})
