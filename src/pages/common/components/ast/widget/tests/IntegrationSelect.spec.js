import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {IntegrationSelectContainer} from '../IntegrationSelect'

describe('ast', () => {
    describe('widgets', () => {
        describe('IntegrationSelect', () => {
            it('should render a loading imput (no integrations)', () => {
                const component = shallow(
                    <IntegrationSelectContainer
                        actions={{
                            fetchIntegrations: jest.fn(),
                        }}
                        onChange={jest.fn()}
                        integrations={fromJS([])}
                    />
                )
                expect(component).toMatchSnapshot()
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
                const component = shallow(
                    <IntegrationSelectContainer
                        value={1}
                        actions={{
                            fetchIntegrations: jest.fn(),
                        }}
                        integrations={integrations}
                        onChange={jest.fn()}
                    />
                )
                expect(component).toMatchSnapshot()
            })
        })
    })
})
