import React from 'react'
import {
    act,
    render,
    fireEvent,
    waitFor,
    waitForElementToBeRemoved,
} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import {AxiosResponse} from 'axios'

import {AuditLogEventsState} from 'state/entities/auditLogEvents/types'
import {fetchEvents} from 'models/event/resources'
import client from 'models/api/resources'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {Event} from 'models/event/types'
import {
    events as eventsFixtures,
    eventsServerMeta as eventsMetaFixtures,
} from 'fixtures/event'
import {RootState, StoreDispatch} from 'state/types'
import {flushPromises} from 'utils/testing'

import UserAuditList from '../UserAuditList'

global.Math.random = () => 0.8

jest.mock('models/event/resources')
jest.mock('pages/common/components/Loader/Loader', () => () => (
    <div>Loader</div>
))
jest.mock('models/event/types', () => {
    const types: Record<string, unknown> =
        jest.requireActual('models/event/types')
    return {
        ...types,
        EventType: {
            AccountCreated: 'account-created',
        },
    }
})

const fetchEventsMock = fetchEvents as jest.MockedFunction<typeof fetchEvents>
const mockServer = new MockAdapter(client)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const defaultState: Partial<RootState> = {
    agents: fromJS({
        all: [
            {id: 1, name: 'agent 1', email: 'agent1@gorgias.com'},
            {id: 2, name: 'agent 2', email: 'agent2@gorgias.com'},
            {id: 3, name: '', email: 'agent3@gorgias.com'},
        ],
    }),
    entities: {
        auditLogEvents: {},
    },
} as RootState

describe('<UserAuditList/>', () => {
    beforeEach(() => {
        mockServer.reset()
        jest.clearAllMocks()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should fetch events on mount and render a loading spinner', async () => {
        const {container, getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <UserAuditList />
            </Provider>
        )

        await waitFor(() => {
            getByText('Loader')
            expect(fetchEventsMock).toHaveBeenCalled()
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    it('should render a message to inform the user no events are available', async () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <UserAuditList />
            </Provider>
        )

        await act(async () => {
            await flushPromises()
        })
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should debounce and re-fetch events on filter update', async () => {
        jest.useFakeTimers()
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <UserAuditList />
            </Provider>
        )

        act(() => {
            fireEvent.click(getByText('agent 1'))
            jest.advanceTimersByTime(1000)
            fireEvent.click(getByText('Account created'))
            jest.advanceTimersByTime(1000)
            fireEvent.click(getByText('calendar_today'))
            fireEvent.click(getByText('Last 3 days'))
            jest.advanceTimersByTime(1000)
        })

        await waitForElementToBeRemoved(() => getByText('Loader'))
        expect(fetchEventsMock).toHaveBeenCalledTimes(4)
    })

    it('should render the fetched events and page navigation', async () => {
        fetchEventsMock.mockResolvedValueOnce({
            data: {
                meta: eventsMetaFixtures,
            },
        } as AxiosResponse<ApiListResponseCursorPagination<Event[]>>)
        const {container, getByText, rerender} = render(
            <Provider store={mockStore(defaultState)}>
                <UserAuditList />
            </Provider>
        )

        await waitForElementToBeRemoved(() => getByText('Loader'))

        const fetchedEvents: AuditLogEventsState = {}
        eventsFixtures.map((event: Event) => {
            fetchedEvents[event.id.toString()] = event
        })

        rerender(
            <Provider
                store={mockStore({
                    ...defaultState,
                    entities: {auditLogEvents: fetchedEvents},
                } as RootState)}
            >
                <UserAuditList />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
