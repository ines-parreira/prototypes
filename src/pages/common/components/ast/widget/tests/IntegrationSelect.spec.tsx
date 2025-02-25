import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationSelectContainer } from 'pages/common/components/ast/widget/IntegrationSelect'

const mockStore = configureMockStore([thunk])

describe('ast', () => {
    describe('widgets', () => {
        describe('IntegrationSelect', () => {
            it('should render a loading imput (no integrations)', () => {
                const { container } = render(
                    <IntegrationSelectContainer
                        value={undefined}
                        fetchIntegrations={jest.fn()}
                        onChange={jest.fn()}
                        integrations={fromJS([])}
                    />,
                )

                expect(container.firstChild).toMatchSnapshot()
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
                ])
                const { container } = render(
                    <Provider store={mockStore({})}>
                        <IntegrationSelectContainer
                            value={1}
                            fetchIntegrations={jest.fn()}
                            integrations={integrations}
                            onChange={jest.fn()}
                        />
                    </Provider>,
                )

                expect(container.firstChild).toMatchSnapshot()
            })
        })
    })
})
