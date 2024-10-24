import {getAllByRole, render} from '@testing-library/react'

import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {Integration as IntegrationType} from 'models/integration/types'
import IntegrationsList from 'pages/integrations/integration/components/app/IntegrationsList'
import {RootState, StoreDispatch} from 'state/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const integrations = [
    {
        id: 1,
        type: 'app',
        application_id: '1',
        name: 'my app',
        meta: {address: '@myapp'},
    } as IntegrationType,
    {
        id: 2,
        type: 'app',
        application_id: '1',
        name: 'my deactivated app',
        meta: {address: '@deactivatedapp'},
        deactivated_datetime: '2021-01-01T00:00:00Z',
    } as IntegrationType,
]

const appStore = mockStore({
    integrations: fromJS({integrations}),
} as unknown as RootState)

describe('<IntegrationsList/>', () => {
    describe('render()', () => {
        it('should render the list of integrations', () => {
            const {container} = render(
                <Provider store={appStore}>
                    <IntegrationsList
                        appId={'1'}
                        connectUrl={'https://test.test'}
                    />
                </Provider>
            )

            const integrationRows = getAllByRole(container, 'row')
            expect(integrationRows.length).toBe(integrations.length)
        })
    })
})
