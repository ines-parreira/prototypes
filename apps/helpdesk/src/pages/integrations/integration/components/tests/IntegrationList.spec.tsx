import React from 'react'

import { screen } from '@testing-library/react'
import { List, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { renderWithRouter } from 'utils/testing'

import IntegrationList from '../IntegrationList'

const mockStore = configureMockStore([thunk])
describe('<IntegrationList />', () => {
    it('should render integrations correctly', () => {
        const integrations = List([
            Map({ id: 1, name: 'Integration 1' }),
            Map({ id: 2, name: 'Integration 2' }),
        ])

        const props = {
            integrationType: 'email',
            integrations,
            createIntegration: jest.fn(),
            loading: Map({}),
            createIntegrationButtonHidden: false,
            integrationToItemDisplay: jest.fn((integration) => (
                <tr
                    key={integration.get('id')}
                    data-testid={`integration-${integration.get('id')}`}
                >
                    <td>{integration.get('name')}</td>
                </tr>
            )),
        }

        renderWithRouter(
            <Provider store={mockStore({})}>
                <IntegrationList {...props} />
            </Provider>,
        )

        expect(screen.getByText('Integration 1')).toBeInTheDocument()
        expect(screen.getByText('Integration 2')).toBeInTheDocument()

        expect(props.integrationToItemDisplay).toHaveBeenCalled()
    })

    it('dont re-render if integrations are the same', () => {
        const integrations = List([Map({ id: 1, name: 'Integration 1' })])

        const props = {
            integrationType: 'email',
            integrations,
            createIntegration: jest.fn(),
            loading: Map({}),
            createIntegrationButtonHidden: false,
            integrationToItemDisplay: jest.fn((integration) => (
                <tr
                    key={integration.get('id')}
                    data-testid={`integration-${integration.get('id')}`}
                >
                    <td>{integration.get('name')}</td>
                </tr>
            )),
        }

        const { rerender } = renderWithRouter(
            <Provider store={mockStore({})}>
                <IntegrationList {...props} />
            </Provider>,
        )

        expect(props.integrationToItemDisplay).toHaveBeenCalledTimes(3)
        rerender(
            <Provider store={mockStore({})}>
                <IntegrationList {...props} />
            </Provider>,
        )
        expect(props.integrationToItemDisplay).toHaveBeenCalledTimes(3)
    })
})
