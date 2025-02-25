import React from 'react'

import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
    waitForElementToBeRemoved,
} from '@testing-library/react'
import { AxiosResponse } from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    events as eventsFixtures,
    eventsServerMeta as eventsMetaFixtures,
} from 'fixtures/event'
import client from 'models/api/resources'
import { ApiListResponseCursorPagination } from 'models/api/types'
import { fetchEvents } from 'models/event/resources'
import { Event } from 'models/event/types'
import { AuditLogEventsState } from 'state/entities/auditLogEvents/types'
import { RootState, StoreDispatch } from 'state/types'
import { flushPromises } from 'utils/testing'

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

const agent1 = { id: 1, name: 'agent 1', email: 'agent1@gorgias.com' }
const agent2 = { id: 2, name: 'agent 2', email: 'agent2@gorgias.com' }
const agent3 = { id: 3, name: ' ', email: 'agent3@gorgias.com' }

const defaultState: Partial<RootState> = {
    agents: fromJS({
        all: [agent1, agent2, agent3],
    }),
    entities: {
        auditLogEvents: {},
    },
} as RootState

describe('<UserAuditList/>', () => {
    beforeEach(() => {
        mockServer.reset()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should fetch events on mount and render a loading spinner', async () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <UserAuditList />
            </Provider>,
        )

        await waitFor(() => {
            expect(screen.getByText('Loader')).toBeInTheDocument()
            expect(fetchEventsMock).toHaveBeenCalled()
        })
    })

    it('should render a message to inform the user no events are available', async () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <UserAuditList />
            </Provider>,
        )

        await act(async () => {
            await flushPromises()
        })
        expect(
            screen.getByText(
                'There is no event recorded matching these filters.',
            ),
        ).toBeInTheDocument()
    })

    it('should debounce and re-fetch events on filter update', async () => {
        jest.useFakeTimers()
        render(
            <Provider store={mockStore(defaultState)}>
                <UserAuditList />
            </Provider>,
        )

        act(() => {
            fireEvent.click(screen.getByText('agent 1'))
            jest.advanceTimersByTime(1000)
        })
        act(() => {
            fireEvent.click(screen.getByText('Account created'))
            jest.advanceTimersByTime(1000)
        })
        act(() => {
            fireEvent.click(screen.getByText('calendar_today'))
            jest.advanceTimersByTime(1000)
        })
        act(() => {
            fireEvent.click(screen.getByText('Last 3 days'))
            jest.advanceTimersByTime(1000)
        })

        await waitForElementToBeRemoved(() => screen.getByText('Loader'))
        expect(fetchEventsMock).toHaveBeenCalledTimes(4)
    })

    it('should render the fetched events and page navigation', async () => {
        fetchEventsMock.mockResolvedValueOnce({
            data: {
                meta: eventsMetaFixtures,
            },
        } as AxiosResponse<ApiListResponseCursorPagination<Event[]>>)
        const { container, rerender } = render(
            <Provider store={mockStore(defaultState)}>
                <UserAuditList />
            </Provider>,
        )

        await waitForElementToBeRemoved(() => screen.getByText('Loader'))

        const fetchedEvents: AuditLogEventsState = {}
        eventsFixtures.map((event: Event) => {
            fetchedEvents[event.id.toString()] = event
        })

        rerender(
            <Provider
                store={mockStore({
                    ...defaultState,
                    entities: { auditLogEvents: fetchedEvents },
                } as RootState)}
            >
                <UserAuditList />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should fetch events when navigating to previous and next pages', async () => {
        jest.useFakeTimers()

        const meta = {
            prev_cursor: '111',
            next_cursor: '222',
        }
        fetchEventsMock.mockResolvedValueOnce({
            data: {
                meta,
            },
        } as AxiosResponse<ApiListResponseCursorPagination<Event[]>>)
        const fetchedEvents: AuditLogEventsState = {}
        eventsFixtures.map((event: Event) => {
            fetchedEvents[event.id.toString()] = event
        })

        render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    entities: { auditLogEvents: fetchedEvents },
                } as RootState)}
            >
                <UserAuditList />
            </Provider>,
        )

        await waitForElementToBeRemoved(() => screen.getByText('Loader'))
        fireEvent.click(screen.getByText('keyboard_arrow_right'))

        await act(async () => {
            await flushPromises()
        })

        expect(fetchEventsMock).toHaveBeenCalledWith(
            expect.objectContaining({
                cursor: meta.next_cursor,
            }),
            expect.anything(),
        )

        fireEvent.click(screen.getByText('keyboard_arrow_left'))
        await act(async () => {
            await flushPromises()
        })

        expect(fetchEventsMock).toHaveBeenCalledWith(
            expect.objectContaining({
                cursor: meta.prev_cursor,
            }),
            expect.anything(),
        )
    })
})
