import React from 'react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {Provider} from 'react-redux'
import MockAdapter from 'axios-mock-adapter'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {QueryClientProvider} from '@tanstack/react-query'

import LD from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'
import {customField} from 'fixtures/customField'
import client from 'models/api/resources'
import {renderWithRouter} from 'utils/testing'

import {createTestQueryClient} from 'tests/reactQueryTestingUtils'
import EditTicketField from '../EditTicketField'

const mockStore = configureMockStore([thunk])()
const mockedServer = new MockAdapter(client)
const queryClient = createTestQueryClient()

describe('<EditTicketField/>', () => {
    beforeEach(async () => {
        mockedServer.reset()
        await queryClient.invalidateQueries()
    })

    it('should not render if the account does not have the feature flag', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({}))

        const {container} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <DndProvider backend={HTML5Backend}>
                        <EditTicketField />
                    </DndProvider>
                </Provider>
            </QueryClientProvider>,
            {
                path: '/ticket-fields/:id/edit',
                route: '/ticket-fields/123/edit',
            }
        )
        expect(container.firstChild).toBeNull()
    })

    it('should render if the account has the feature flag', async () => {
        mockedServer.onGet('/api/custom-fields/123').reply(200, customField)
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.TicketFields]: true,
        }))

        const {container, findByText} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <EditTicketField />
                </Provider>
            </QueryClientProvider>,

            {
                path: '/ticket-fields/:id/edit',
                route: '/ticket-fields/123/edit',
            }
        )
        expect(container.firstChild).toMatchSnapshot()

        await findByText(customField.label)
        expect(container.firstChild).toMatchSnapshot()
    })
})
