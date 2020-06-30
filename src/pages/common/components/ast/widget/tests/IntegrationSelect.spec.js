import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import IntegrationSelect from '../IntegrationSelect'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('ast', () => {
    describe('widgets', () => {
        describe('IntegrationSelect', () => {
            it('should render a loading imput (no integrations)', () => {
                const store = mockStore({})
                const component = shallow(
                    <IntegrationSelect
                        store={store}
                        actions={{
                            fetchIntegrations: jest.fn(),
                        }}
                        onChange={jest.fn()}
                    />
                )
                expect(component.dive()).toMatchSnapshot()
            })

            it('should render a SelectField', () => {
                const integrations = fromJS([
                    {
                        id: 1,
                        name: 'Acme Support',
                        type: 'email',
                        meta: {
                            address: 'support@acme.gorgias.io',
                        },
                    },
                    {
                        id: 2,
                        name: 'Acme Chat',
                        type: 'smooch_inside',
                        meta: {
                            app_id: '123456uy5tr1d2g3h4',
                        },
                    },
                ])
                const store = mockStore({
                    integrations: fromJS({
                        integrations,
                    }),
                })
                const component = shallow(
                    <IntegrationSelect
                        value={1}
                        store={store}
                        actions={{
                            fetchIntegrations: jest.fn(),
                        }}
                        integrations={integrations}
                        onChange={jest.fn()}
                    />
                )
                expect(component.dive()).toMatchSnapshot()
            })
        })
    })
})
