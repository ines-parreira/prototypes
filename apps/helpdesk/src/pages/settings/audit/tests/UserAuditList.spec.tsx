import client from '@repo/api-resources'
import { flushPromises, render } from '@repo/testing'
import {
    act,
    fireEvent,
    screen,
    waitFor,
    waitForElementToBeRemoved,
} from '@testing-library/react'
import type { AxiosResponse } from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'

import {
    events as eventsFixtures,
    eventsServerMeta as eventsMetaFixtures,
} from 'fixtures/event'
import type { ApiListResponseCursorPagination } from 'models/api/types'
import { fetchEvents } from 'models/event/resources'
import type { Event } from 'models/event/types'
import type { AuditLogEventsState } from 'state/entities/auditLogEvents/types'
import type { RootState } from 'state/types'

import { UserAuditList } from '../UserAuditList'

global.Math.random = () => 0.8
jest.mock('models/event/resources')
jest.mock('pages/common/components/Loader/Loader', () => ({
    Loader: () => <div>Loader</div>,
}))
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
        render(<UserAuditList />, {
            storeState: defaultState,
        })
        await waitFor(() => {
            expect(screen.getByText('Loader')).toBeInTheDocument()
            expect(fetchEventsMock).toHaveBeenCalled()
        })
    })
    it('should render a message to inform the user no events are available', async () => {
        render(<UserAuditList />, {
            storeState: defaultState,
        })
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
        render(<UserAuditList />, {
            storeState: defaultState,
        })
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
        await waitFor(() => {
            expect(fetchEventsMock).toHaveBeenCalledTimes(4)
        })
    })
    it('should render the fetched events and page navigation', async () => {
        fetchEventsMock.mockResolvedValueOnce({
            data: {
                meta: eventsMetaFixtures,
            },
        } as AxiosResponse<ApiListResponseCursorPagination<Event[]>>)
        const fetchedEvents: AuditLogEventsState = {}
        eventsFixtures.map((event: Event) => {
            fetchedEvents[event.id.toString()] = event
        })
        render(<UserAuditList />, {
            storeState: {
                ...defaultState,
                entities: { auditLogEvents: fetchedEvents },
            } as RootState,
        })
        await waitForElementToBeRemoved(() => screen.getByText('Loader'))
        expect(screen.getAllByText('agent 1').length).toBeGreaterThan(0)
        expect(screen.getAllByText('January 25, 2022 10:39 AM')).toHaveLength(3)
        expect(screen.getByText('keyboard_arrow_right')).toBeInTheDocument()
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
        render(<UserAuditList />, {
            storeState: {
                ...defaultState,
                entities: { auditLogEvents: fetchedEvents },
            } as RootState,
        })
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
