import React from 'react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import * as ReactRouterDom from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import HTTP from '../HTTP'
import {
    EVENTS_PATH,
    INTEGRATIONS_LIST_PATH,
    NEW_INTEGRATION_PATH,
} from '../constants'

jest.mock('react-router', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router'),
    useParams: jest.fn(),
}))
const useParamsMock = jest.spyOn(ReactRouterDom, 'useParams')

const mockStore = configureMockStore([thunk])
const store = mockStore({integrations: fromJS({integrations: []})})

jest.mock('pages/common/components/PageHeader', () => () => <div>Header</div>)
jest.mock(
    'pages/integrations/integration/components/http/SecondaryNavigation',
    () => () => <div>Nav</div>
)
jest.mock(
    'pages/integrations/integration/components/http/Overview/Details',
    () => () => <div>Details</div>
)
jest.mock(
    'pages/integrations/integration/components/http/Overview/List',
    () => () => <div>List</div>
)
jest.mock(
    'pages/integrations/integration/components/http/Integration',
    () => () => <div>Integration</div>
)
jest.mock('pages/integrations/integration/components/http/Events', () => () => (
    <div>Events</div>
))
jest.mock('pages/integrations/integration/components/http/Event', () => () => (
    <div>Event</div>
))

describe('HTTP', () => {
    it.each([
        [{}, 'Detail'],
        [{integrationId: INTEGRATIONS_LIST_PATH}, 'List'],
        [{integrationId: NEW_INTEGRATION_PATH}, 'Integration'],
        [{integrationId: '1'}, 'Integration'],
        [{integrationId: '1', extra: EVENTS_PATH}, 'Events'],
        [{integrationId: '1', extra: EVENTS_PATH, subId: '1'}, 'Event'],
    ])(
        'should render the correct component',
        (routeParams, expectedComponent) => {
            useParamsMock.mockReturnValue(routeParams)
            const {queryByText} = render(
                <Provider store={store}>
                    <HTTP />
                </Provider>
            )

            expect(queryByText('Header'))
            expect(queryByText('Nav'))
            expect(queryByText(expectedComponent))
        }
    )
})
