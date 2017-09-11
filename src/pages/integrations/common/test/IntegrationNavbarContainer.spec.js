import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

import IntegrationNavbarContainer from './../IntegrationNavbarContainer'

describe('IntegrationNavbarContainer', () => {
    it('should display correctly the name of Facebook integration', () => {
        const component = mount(
            <Provider store={mockStore({
                integrations: fromJS({
                    integrations: [{
                        id: 78945,
                        name: 'foo',
                        facebook: {
                            name: 'bar'
                        }
                    }]
                })
            })}>
                <IntegrationNavbarContainer
                    params={{
                        integrationType: 'facebook',
                        integrationId: '78945',
                        extra: 'overview'
                    }}
                />
            </Provider>
        )

        expect(component).toMatchSnapshot()
    })

    it('should display correctly the name of Smooch Inside integration', () => {
        const component = mount(
            <Provider store={mockStore({
                integrations: fromJS({
                    integrations: [{
                        id: 78945,
                        name: 'foo',
                    }]
                })
            })}>
                <IntegrationNavbarContainer
                    params={{
                        integrationType: 'smooch_inside',
                        integrationId: '78945',
                        extra: 'appearance'
                    }}
                />
            </Provider>
        )

        expect(component).toMatchSnapshot()
    })
})
