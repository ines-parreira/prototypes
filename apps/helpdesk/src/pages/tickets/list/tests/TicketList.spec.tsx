import { ComponentProps, ReactNode } from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent } from '@testing-library/react'
import decorateComponentWithProps from 'decorate-component-with-props'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { view as fixtureView } from 'fixtures/views'
import useAppDispatch from 'hooks/useAppDispatch'
import { EntityType } from 'models/view/types'
import CreateTicketButton from 'pages/common/components/CreateTicket/CreateTicketButton'
import * as ViewTable from 'pages/common/components/ViewTable/ViewTable'
import MacroContainer from 'pages/tickets/common/macros/MacroContainer'
import TicketList from 'pages/tickets/list/TicketList'
import { fetchTags } from 'state/tags/actions'
import { updateSelectedItemsIds } from 'state/views/actions'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

jest.mock('decorate-component-with-props')
const decorateComponentWithPropsMock = assumeMock(decorateComponentWithProps)
decorateComponentWithPropsMock.mockImplementation((_component, props) => () => (
    <>
        Props:
        {Object.entries(props as { openMacroModal: () => void }).map(
            ([propName, value]) => (
                <div key={propName} onClick={value}>
                    {propName}
                </div>
            ),
        )}
    </>
))

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock
const dispatch = jest.fn()
useAppDispatchMock.mockReturnValue(dispatch)

jest.mock('state/tags/actions')
const fetchTagsMock = (
    fetchTags as jest.MockedFunction<typeof fetchTags>
).mockReturnValue(() => Promise.resolve(undefined))

jest.mock('state/views/actions')
const updateSelectedItemsIdsMock = assumeMock(updateSelectedItemsIds)

jest.mock(
    'pages/common/components/SearchRankScenarioProvider/SearchRankScenarioProvider',
    () =>
        ({ children }: { children: ReactNode }) => (
            <div data-testid="search-rank-scenario-provider">{children}</div>
        ),
)
const mockItemsIds = fromJS([111])
jest.mock(
    'pages/tickets/common/macros/MacroContainer',
    () =>
        ({ onComplete }: ComponentProps<typeof MacroContainer>) => (
            <div onClick={() => onComplete?.(mockItemsIds)}>MacroContainer</div>
        ),
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
        }) as Record<string, unknown>,
)

jest.mock('common/segment')

const mockViewTickets = jest.fn()
jest.mock('providers/realtime-ably/hooks/useAblyAgentActivity', () => ({
    useAblyAgentActivity: () => ({
        viewTickets: mockViewTickets,
    }),
}))

const mockStore = configureMockStore([thunk])
const store = mockStore({
    tickets: fromJS({ items: [] }),
    views: fromJS({
        active: fixtureView,
        _internal: {
            selectedItemsIds: [],
        },
    }),
})

jest.mock('pages/common/components/CreateTicket/CreateTicketButton')
const MockCreateTicketButton = CreateTicketButton as jest.Mock
MockCreateTicketButton.mockImplementation(() => <div>CreateTicketButton</div>)

const mockedQueryClient = mockQueryClient()

describe('<TicketList />', () => {
    beforeEach(() => {
        jest.spyOn(ViewTable, 'default').mockImplementation(
            ({
                items,
                isUpdate,
                isSearch,
                urlViewId,
                ActionsComponent,
                viewButtons,
            }: ComponentProps<typeof ViewTable.ViewTableContainer>) => {
                return (
                    <div>
                        ViewTable:
                        <div>items: {JSON.stringify(items)}</div>
                        <div>isUpdate: {JSON.stringify(isUpdate)}</div>
                        <div>isSearch: {JSON.stringify(isSearch)}</div>
                        <div>urlViewId: {JSON.stringify(urlViewId)}</div>
                        <div>
                            ActionsComponent:
                            {ActionsComponent && <ActionsComponent />}
                        </div>
                        <div>{viewButtons}</div>
                    </div>
                )
            },
        )
    })

    it('should display with default props', () => {
        const { container } = renderWithRouter(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider store={store}>
                    <TicketList />
                </Provider>
            </QueryClientProvider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should fetch the tags on load', () => {
        renderWithRouter(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider store={store}>
                    <TicketList />
                </Provider>
            </QueryClientProvider>,
        )
        expect(fetchTagsMock).toHaveBeenCalled()
    })

    it('should display "New view" as title', () => {
        renderWithRouter(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider store={store}>
                    <TicketList />
                </Provider>
            </QueryClientProvider>,
            {
                path: 'app/tickets/',
                route: 'app/tickets/new',
            },
        )
        expect(document.title).toEqual('New view')
    })

    it(`should display "${fixtureView.name}" as title`, () => {
        renderWithRouter(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider store={store}>
                    <TicketList />
                </Provider>
            </QueryClientProvider>,
        )
        expect(document.title).toEqual(fixtureView.name)
    })

    it('should display Search as title', () => {
        renderWithRouter(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider store={store}>
                    <TicketList />
                </Provider>
            </QueryClientProvider>,
            {
                path: 'app/tickets/',
                route: 'app/tickets/search',
            },
        )
        expect(document.title).toEqual('Search')
    })

    it('should render SearchRankProvider on search url', () => {
        const { container } = renderWithRouter(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider store={store}>
                    <TicketList />
                </Provider>
            </QueryClientProvider>,
            {
                path: 'app/tickets/',
                route: 'app/tickets/search',
            },
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render CreateTicketButton when not in edit mode', () => {
        const { queryByText } = renderWithRouter(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider store={store}>
                    <TicketList />
                </Provider>
            </QueryClientProvider>,
        )

        expect(queryByText('CreateTicketButton')).toBeInTheDocument()
    })

    it('should not render CreateTicketButton when in edit mode', () => {
        const { queryByText } = renderWithRouter(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider
                    store={mockStore({
                        tickets: fromJS({ items: [] }),
                        views: fromJS({
                            active: { ...fixtureView, editMode: true },
                            _internal: {
                                selectedItemsIds: [],
                            },
                        }),
                    })}
                >
                    <TicketList />
                </Provider>
            </QueryClientProvider>,
        )

        expect(queryByText('CreateTicketButton')).not.toBeInTheDocument()
    })

    it('should render ViewTable with tickets', () => {
        const spy = jest
            .spyOn(ViewTable, 'default')
            .mockImplementation(() => <div />)

        renderWithRouter(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider
                    store={mockStore({
                        tickets: fromJS({ items: [] }),
                        views: fromJS({
                            active: { ...fixtureView, editMode: true },
                            _internal: {
                                selectedItemsIds: [],
                            },
                        }),
                    })}
                >
                    <TicketList />
                </Provider>
            </QueryClientProvider>,
        )

        expect(spy).toHaveBeenCalledWith(
            expect.objectContaining({
                isSearch: false,
                type: EntityType.Ticket,
            }),
            {},
        )
    })

    it('should render Search ViewTable with tickets_with_highlights', () => {
        const history = createMemoryHistory({
            initialEntries: ['app/tickets/search'],
        })
        const spy = jest
            .spyOn(ViewTable, 'default')
            .mockImplementation(() => <div />)

        renderWithRouter(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider
                    store={mockStore({
                        tickets: fromJS({ items: [] }),
                        views: fromJS({
                            active: { ...fixtureView, editMode: true },
                            _internal: {
                                selectedItemsIds: [],
                            },
                        }),
                    })}
                >
                    <TicketList />
                </Provider>
            </QueryClientProvider>,
            {
                path: 'app/tickets/search',
                history,
            },
        )

        expect(spy).toHaveBeenCalledWith(
            expect.objectContaining({
                isSearch: true,
                type: EntityType.Ticket,
            }),
            {},
        )
    })

    it('should trigger update of selected items ids', () => {
        const { getByText } = renderWithRouter(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider store={store}>
                    <TicketList />
                </Provider>
            </QueryClientProvider>,
        )

        fireEvent.click(getByText('openMacroModal'))
        fireEvent.click(getByText('MacroContainer'))
        expect(updateSelectedItemsIdsMock).toHaveBeenCalledWith(mockItemsIds)
    })

    it('should call viewTickets with ticket ids', () => {
        renderWithRouter(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider
                    store={mockStore({
                        tickets: fromJS({ items: [{ id: 1 }, { id: 2 }] }),
                        views: fromJS({
                            active: fixtureView,
                            _internal: {
                                selectedItemsIds: [],
                            },
                        }),
                    })}
                >
                    <TicketList />
                </Provider>
            </QueryClientProvider>,
        )

        expect(mockViewTickets).toHaveBeenCalledWith([1, 2])
    })
})
