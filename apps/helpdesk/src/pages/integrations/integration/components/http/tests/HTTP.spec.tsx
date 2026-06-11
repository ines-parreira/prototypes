import { render } from '@repo/testing'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter, useParams } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    EVENTS_PATH,
    INTEGRATIONS_LIST_PATH,
    NEW_INTEGRATION_PATH,
} from '../constants'
import { Http as HTTP } from '../HTTP'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

const useParamsMock = useParams as jest.Mock

const mockStore = configureMockStore([thunk])
const store = mockStore({ integrations: fromJS({ integrations: [] }) })

jest.mock('pages/common/components/PageHeader', () => ({
    PageHeader: () => <div>Header</div>,
}))
jest.mock(
    'pages/integrations/integration/components/http/SecondaryNavigation',
    () => ({ SecondaryNavigation: () => <div>Nav</div> }),
)
jest.mock(
    'pages/integrations/integration/components/http/Overview/Details',
    () => ({ Details: () => <div>Details</div> }),
)
jest.mock(
    'pages/integrations/integration/components/http/Overview/List',
    () => ({ List: () => <div>List</div> }),
)
jest.mock('pages/integrations/integration/components/http/Integration', () => ({
    Integration: () => <div>Integration</div>,
}))
jest.mock('pages/integrations/integration/components/http/Events', () => ({
    Events: () => <div>Events</div>,
}))
jest.mock('pages/integrations/integration/components/http/Event', () => ({
    Event: () => <div>Event</div>,
}))

describe('HTTP', () => {
    it.each([
        [{}, 'Detail'],
        [{ integrationId: INTEGRATIONS_LIST_PATH }, 'List'],
        [{ integrationId: NEW_INTEGRATION_PATH }, 'Integration'],
        [{ integrationId: '1' }, 'Integration'],
        [{ integrationId: '1', extra: EVENTS_PATH }, 'Events'],
        [{ integrationId: '1', extra: EVENTS_PATH, subId: '1' }, 'Event'],
    ])(
        'should render the correct component',
        (routeParams, expectedComponent) => {
            useParamsMock.mockReturnValue(routeParams)
            const { queryByText } = render(
                <MemoryRouter>
                    <Provider store={store}>
                        <HTTP />
                    </Provider>
                </MemoryRouter>,
            )

            expect(queryByText('Header'))
            expect(queryByText('Nav'))
            expect(queryByText(expectedComponent))
        },
    )
})
