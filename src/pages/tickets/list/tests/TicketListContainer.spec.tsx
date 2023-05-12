import React, {ComponentProps, ReactNode} from 'react'
import {fromJS} from 'immutable'
import userEvent from '@testing-library/user-event'
import {act, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {user} from 'fixtures/users'
import {view as fixtureView} from 'fixtures/views'
import ViewTable from 'pages/common/components/ViewTable/ViewTable'
import LocalForageManager from 'services/localForageManager/localForageManager'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {flushPromises, renderWithRouter} from 'utils/testing'

import {TicketListContainer} from '../TicketListContainer'

const mockSetItem = jest.fn()
const mockGetItem = jest.fn()
const mockGetTableObject = {
    getItem: mockGetItem,
    setItem: mockSetItem,
} as unknown as LocalForage

jest.spyOn(LocalForageManager, 'getTable').mockReturnValue(mockGetTableObject)

jest.mock(
    'pages/common/components/ViewTable/ViewTable',
    () =>
        ({
            items,
            isUpdate,
            isSearch,
            urlViewId,
            ActionsComponent,
            viewButtons,
        }: ComponentProps<typeof ViewTable>) =>
            (
                <div>
                    ViewTable:
                    <div>items: {JSON.stringify(items)}</div>
                    <div>isUpdate: {JSON.stringify(isUpdate)}</div>
                    <div>isSearch: {JSON.stringify(isSearch)}</div>
                    <div>urlViewId: {JSON.stringify(urlViewId)}</div>
                    <div>
                        ActionsComponent:
                        {
                            //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                            ActionsComponent.toString()
                        }
                    </div>
                    <div>{viewButtons}</div>
                </div>
            )
)

jest.mock(
    'pages/common/components/SearchRankScenarioProvider/SearchRankScenarioProvider',
    () =>
        ({children}: {children: ReactNode}) =>
            <div data-testid="search-rank-scenario-provider">{children}</div>
)

const mockHistoryPush = jest.fn()

jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            useHistory: () => ({
                push: mockHistoryPush,
            }),
        } as Record<string, unknown>)
)

jest.mock('store/middlewares/segmentTracker')

const logEventMock = logEvent as jest.Mock

const mockStore = configureMockStore([thunk])
const store = mockStore({
    currentUser: fromJS(user),
})

describe('<TicketListContainer />', () => {
    const minProps = {
        activeView: fromJS(fixtureView),
        fetchTags: jest.fn(),
        hasActiveView: true,
        selectedItemsIds: fromJS([]),
        tickets: fromJS([]),
    } as unknown as ComponentProps<typeof TicketListContainer>

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should display with default props', () => {
        const {container} = renderWithRouter(
            <Provider store={store}>
                <TicketListContainer {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should fetch the tags on load', () => {
        renderWithRouter(
            <Provider store={store}>
                <TicketListContainer {...minProps} />
            </Provider>
        )
        expect(minProps.fetchTags).toHaveBeenCalled()
    })

    it('should display "New view" as title', () => {
        renderWithRouter(
            <Provider store={store}>
                <TicketListContainer {...minProps} />
            </Provider>,
            {
                path: 'app/tickets/',
                route: 'app/tickets/new',
            }
        )
        expect(document.title).toEqual('New view')
    })

    it(`should display "${
        minProps.activeView.get('name') as string
    }" as title`, () => {
        renderWithRouter(
            <Provider store={store}>
                <TicketListContainer {...minProps} />
            </Provider>
        )
        expect(document.title).toEqual(minProps.activeView.get('name'))
    })

    it('should display Search as title', () => {
        renderWithRouter(
            <Provider store={store}>
                <TicketListContainer {...minProps} />
            </Provider>,
            {
                path: 'app/tickets/',
                route: 'app/tickets/search',
            }
        )
        expect(document.title).toEqual('Search')
    })

    it('should render SearchRankProvider on search url', () => {
        const {container} = renderWithRouter(
            <Provider store={store}>
                <TicketListContainer {...minProps} />
            </Provider>,
            {
                path: 'app/tickets/',
                route: 'app/tickets/search',
            }
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render draft dropdown when there is a draft', async () => {
        jest.spyOn(LocalForageManager, 'getTable').mockReturnValueOnce({
            ...mockGetTableObject,
            getItem: jest.fn().mockResolvedValue({subject: 'title'}),
        })

        const {getByText} = renderWithRouter(
            <Provider store={store}>
                <TicketListContainer {...minProps} />
            </Provider>
        )
        await act(flushPromises)
        const createTicketButton = getByText('Create ticket')
        userEvent.click(createTicketButton)
        expect(document.body.children).toMatchSnapshot()
    })

    it('should handle draft resuming', async () => {
        jest.spyOn(LocalForageManager, 'getTable').mockReturnValueOnce({
            ...mockGetTableObject,
            getItem: jest.fn().mockResolvedValue({subject: 'title'}),
        })

        const {getByText} = renderWithRouter(
            <Provider store={store}>
                <TicketListContainer {...minProps} />
            </Provider>
        )
        await act(flushPromises)
        const createTicketButton = getByText('Create ticket')
        userEvent.click(createTicketButton)
        const resumeDraftButton = getByText('Resume draft')
        userEvent.click(resumeDraftButton)
        expect(mockHistoryPush).toHaveBeenCalledWith('/app/ticket/new')
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.DraftTicket,
            expect.objectContaining({
                type: 'resume',
                user_id: user.id,
            })
        )
    })

    it('should handle draft discarding', async () => {
        const mockClear = jest.fn().mockResolvedValue(true)
        jest.spyOn(LocalForageManager, 'getTable').mockReturnValueOnce({
            ...mockGetTableObject,
            getItem: jest.fn().mockResolvedValue({subject: 'title'}),
            clear: mockClear,
        })

        const {getByText} = renderWithRouter(
            <Provider store={store}>
                <TicketListContainer {...minProps} />
            </Provider>
        )
        await act(flushPromises)
        const createTicketButton = getByText('Create ticket')
        userEvent.click(createTicketButton)
        const discardDraftButton = getByText('Discard and create new ticket')
        userEvent.click(discardDraftButton)
        await waitFor(() => {
            expect(mockClear).toHaveBeenCalled()
            expect(mockHistoryPush).toHaveBeenCalledWith('/app/ticket/new')
        })
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.DraftTicket,
            expect.objectContaining({
                type: 'discard',
                user_id: user.id,
            })
        )
    })
})
