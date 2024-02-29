import React, {ComponentProps, ReactNode} from 'react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {view as fixtureView} from 'fixtures/views'
import useShortcuts from 'hooks/useShortcuts'
import ViewTable from 'pages/common/components/ViewTable/ViewTable'
import CreateTicketButton from 'pages/common/components/CreateTicket/CreateTicketButton'
import {SHORTCUT_MANAGER_COMPONENT_NAME} from 'pages/tickets/list/components/TicketListActions'
import {fetchTags} from 'state/tags/actions'

import {renderWithRouter} from 'utils/testing'

jest.mock('state/tags/actions')
import TicketList from '../TicketList'

const fetchTagsMock = (
    fetchTags as jest.MockedFunction<typeof fetchTags>
).mockReturnValue(() => Promise.resolve(undefined))

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

jest.mock('common/segment')

const mockStore = configureMockStore([thunk])
const store = mockStore({
    tickets: fromJS({items: []}),
    views: fromJS({
        active: fixtureView,
        _internal: {
            selectedItemsIds: [],
        },
    }),
})

jest.mock('hooks/useShortcuts')
const useShortcutsMock = useShortcuts as jest.Mock

jest.mock('pages/common/components/CreateTicket/CreateTicketButton')
const MockCreateTicketButton = CreateTicketButton as jest.Mock

describe('<TicketList />', () => {
    beforeEach(() => {
        MockCreateTicketButton.mockImplementation(() => (
            <div>CreateTicketButton</div>
        ))
    })

    it('should display with default props', () => {
        const {container} = renderWithRouter(
            <Provider store={store}>
                <TicketList />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should fetch the tags on load', () => {
        renderWithRouter(
            <Provider store={store}>
                <TicketList />
            </Provider>
        )
        expect(fetchTagsMock).toHaveBeenCalled()
    })

    it('should display "New view" as title', () => {
        renderWithRouter(
            <Provider store={store}>
                <TicketList />
            </Provider>,
            {
                path: 'app/tickets/',
                route: 'app/tickets/new',
            }
        )
        expect(document.title).toEqual('New view')
    })

    it(`should display "${fixtureView.name}" as title`, () => {
        renderWithRouter(
            <Provider store={store}>
                <TicketList />
            </Provider>
        )
        expect(document.title).toEqual(fixtureView.name)
    })

    it('should display Search as title', () => {
        renderWithRouter(
            <Provider store={store}>
                <TicketList />
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
                <TicketList />
            </Provider>,
            {
                path: 'app/tickets/',
                route: 'app/tickets/search',
            }
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should bind keyboard shortcuts', () => {
        renderWithRouter(
            <Provider store={store}>
                <TicketList />
            </Provider>
        )
        expect(useShortcutsMock).toHaveBeenCalledWith(
            SHORTCUT_MANAGER_COMPONENT_NAME,
            {
                CREATE_TICKET: {
                    action: expect.any(Function),
                },
            }
        )
    })

    it('should render CreateTicketButton when not in edit mode', () => {
        const {queryByText} = renderWithRouter(
            <Provider store={store}>
                <TicketList />
            </Provider>
        )

        expect(queryByText('CreateTicketButton')).toBeInTheDocument()
    })

    it('should not render CreateTicketButton when in edit mode', () => {
        const {queryByText} = renderWithRouter(
            <Provider
                store={mockStore({
                    tickets: fromJS({items: []}),
                    views: fromJS({
                        active: {...fixtureView, editMode: true},
                        _internal: {
                            selectedItemsIds: [],
                        },
                    }),
                })}
            >
                <TicketList />
            </Provider>
        )

        expect(queryByText('CreateTicketButton')).not.toBeInTheDocument()
    })
})
