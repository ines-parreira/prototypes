import type { ComponentProps, ReactNode } from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent } from '@testing-library/react'
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
import type MacroContainer from 'pages/tickets/common/macros/MacroContainer'
import * as TicketListActionsModule from 'pages/tickets/list/components/TicketListActions'
import TicketList from 'pages/tickets/list/TicketList'
import { fetchTags } from 'state/tags/actions'
import { updateSelectedItemsIds } from 'state/views/actions'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

jest.mock('pages/tickets/list/components/TicketListActions')
const TicketListActionsMock =
    TicketListActionsModule.TicketListActions as jest.Mock
TicketListActionsMock.mockImplementation(
    ({
        openMacroModal,
    }: ComponentProps<typeof TicketListActionsModule.TicketListActions>) => (
        <div onClick={openMacroModal}>TicketListActions</div>
    ),
)

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

jest.mock('@repo/logging')

const mockViewTickets = jest.fn()
jest.mock('@gorgias/realtime', () => ({
    useAgentActivity: () => ({
        viewTickets: mockViewTickets,
    }),
}))

const mockShouldShowTranslatedContent = jest.fn().mockReturnValue(true)
const mockTranslationMap: Record<number, { subject: string; excerpt: string }> =
    {}
jest.mock('@repo/tickets', () => ({
    ...jest.requireActual('@repo/tickets'),
    useCurrentUserLanguagePreferences: () => ({
        shouldShowTranslatedContent: mockShouldShowTranslatedContent,
    }),
    useTicketsTranslatedProperties: () => ({
        translationMap: mockTranslationMap,
        updateTicketTranslatedSubject: jest.fn(),
        isInitialLoading: false,
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

        fireEvent.click(getByText('TicketListActions'))
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

    describe('ticket translations', () => {
        beforeEach(() => {
            Object.keys(mockTranslationMap).forEach((key) => {
                delete mockTranslationMap[Number(key)]
            })
        })

        afterEach(() => {
            mockShouldShowTranslatedContent.mockReturnValue(true)
            mockShouldShowTranslatedContent.mockClear()
        })

        it('should not apply translations when shouldShowTranslatedContent returns false', () => {
            mockShouldShowTranslatedContent.mockReturnValue(false)

            const spy = jest
                .spyOn(ViewTable, 'default')
                .mockImplementation(() => <div />)

            renderWithRouter(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider
                        store={mockStore({
                            tickets: fromJS({
                                items: [
                                    {
                                        id: 1,
                                        subject: 'Original Subject',
                                        excerpt: 'Original Excerpt',
                                        language: 'en',
                                    },
                                ],
                            }),
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

            const items = spy.mock.calls[0][0].items
            expect(items.get(0).get('subject')).toBe('Original Subject')
            expect(items.get(0).get('excerpt')).toBe('Original Excerpt')
            expect(mockShouldShowTranslatedContent).toHaveBeenCalledWith('en')
        })

        it('should not apply translations when ticket has no language property', () => {
            mockShouldShowTranslatedContent.mockReturnValue(true)

            const spy = jest
                .spyOn(ViewTable, 'default')
                .mockImplementation(() => <div />)

            renderWithRouter(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider
                        store={mockStore({
                            tickets: fromJS({
                                items: [
                                    {
                                        id: 1,
                                        subject: 'Original Subject',
                                        excerpt: 'Original Excerpt',
                                    },
                                ],
                            }),
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

            const items = spy.mock.calls[0][0].items
            expect(items.get(0).get('subject')).toBe('Original Subject')
            expect(items.get(0).get('excerpt')).toBe('Original Excerpt')
            expect(mockShouldShowTranslatedContent).not.toHaveBeenCalled()
        })

        it('should apply translations when shouldShowTranslatedContent returns true and translation exists', () => {
            mockShouldShowTranslatedContent.mockReturnValue(true)
            mockTranslationMap[1] = {
                subject: 'Translated Subject',
                excerpt: 'Translated Excerpt',
            }

            const spy = jest
                .spyOn(ViewTable, 'default')
                .mockImplementation(() => <div />)

            renderWithRouter(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider
                        store={mockStore({
                            tickets: fromJS({
                                items: [
                                    {
                                        id: 1,
                                        subject: 'Original Subject',
                                        excerpt: 'Original Excerpt',
                                        language: 'es',
                                    },
                                ],
                            }),
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

            const items = spy.mock.calls[0][0].items
            expect(items.get(0).get('subject')).toBe('Translated Subject')
            expect(items.get(0).get('excerpt')).toBe('Translated Excerpt')
            expect(mockShouldShowTranslatedContent).toHaveBeenCalledWith('es')
        })

        it('should keep original content when shouldShowTranslatedContent returns true but no translation exists', () => {
            mockShouldShowTranslatedContent.mockReturnValue(true)

            const spy = jest
                .spyOn(ViewTable, 'default')
                .mockImplementation(() => <div />)

            renderWithRouter(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider
                        store={mockStore({
                            tickets: fromJS({
                                items: [
                                    {
                                        id: 1,
                                        subject: 'Original Subject',
                                        excerpt: 'Original Excerpt',
                                        language: 'es',
                                    },
                                ],
                            }),
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

            const items = spy.mock.calls[0][0].items
            expect(items.get(0).get('subject')).toBe('Original Subject')
            expect(items.get(0).get('excerpt')).toBe('Original Excerpt')
        })

        it('should handle multiple tickets with mixed translation scenarios', () => {
            const mockShouldShowTranslatedContentImpl = jest.fn(
                (language) => language !== 'en',
            )
            mockShouldShowTranslatedContent.mockImplementation(
                mockShouldShowTranslatedContentImpl,
            )

            const spy = jest
                .spyOn(ViewTable, 'default')
                .mockImplementation(() => <div />)

            renderWithRouter(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider
                        store={mockStore({
                            tickets: fromJS({
                                items: [
                                    {
                                        id: 1,
                                        subject: 'English Subject',
                                        excerpt: 'English Excerpt',
                                        language: 'en',
                                    },
                                    {
                                        id: 2,
                                        subject: 'Spanish Subject',
                                        excerpt: 'Spanish Excerpt',
                                        language: 'es',
                                    },
                                    {
                                        id: 3,
                                        subject: 'No Language Subject',
                                        excerpt: 'No Language Excerpt',
                                    },
                                ],
                            }),
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

            const items = spy.mock.calls[0][0].items
            expect(items.get(0).get('subject')).toBe('English Subject')
            expect(items.get(1).get('subject')).toBe('Spanish Subject')
            expect(items.get(2).get('subject')).toBe('No Language Subject')
            expect(mockShouldShowTranslatedContentImpl).toHaveBeenCalledWith(
                'en',
            )
            expect(mockShouldShowTranslatedContentImpl).toHaveBeenCalledWith(
                'es',
            )
            expect(mockShouldShowTranslatedContentImpl).toHaveBeenCalledTimes(2)
        })

        it('should call shouldShowTranslatedContent with correct language for each ticket', () => {
            mockShouldShowTranslatedContent.mockReturnValue(false)

            jest.spyOn(ViewTable, 'default').mockImplementation(() => <div />)

            renderWithRouter(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider
                        store={mockStore({
                            tickets: fromJS({
                                items: [
                                    {
                                        id: 1,
                                        subject: 'Subject 1',
                                        language: 'en',
                                    },
                                    {
                                        id: 2,
                                        subject: 'Subject 2',
                                        language: 'fr',
                                    },
                                    {
                                        id: 3,
                                        subject: 'Subject 3',
                                        language: 'de',
                                    },
                                ],
                            }),
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

            expect(mockShouldShowTranslatedContent).toHaveBeenCalledWith('en')
            expect(mockShouldShowTranslatedContent).toHaveBeenCalledWith('fr')
            expect(mockShouldShowTranslatedContent).toHaveBeenCalledWith('de')
            expect(mockShouldShowTranslatedContent).toHaveBeenCalledTimes(3)
        })

        it('should apply partial translations when only subject is translated', () => {
            mockShouldShowTranslatedContent.mockReturnValue(true)
            mockTranslationMap[1] = {
                subject: 'Translated Subject',
                excerpt: '',
            }

            const spy = jest
                .spyOn(ViewTable, 'default')
                .mockImplementation(() => <div />)

            renderWithRouter(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider
                        store={mockStore({
                            tickets: fromJS({
                                items: [
                                    {
                                        id: 1,
                                        subject: 'Original Subject',
                                        excerpt: 'Original Excerpt',
                                        language: 'ja',
                                    },
                                ],
                            }),
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

            const items = spy.mock.calls[0][0].items
            expect(items.get(0).get('subject')).toBe('Translated Subject')
            expect(items.get(0).get('excerpt')).toBe('')
        })

        it('should apply partial translations when only excerpt is translated', () => {
            mockShouldShowTranslatedContent.mockReturnValue(true)
            mockTranslationMap[1] = {
                subject: '',
                excerpt: 'Translated Excerpt',
            }

            const spy = jest
                .spyOn(ViewTable, 'default')
                .mockImplementation(() => <div />)

            renderWithRouter(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider
                        store={mockStore({
                            tickets: fromJS({
                                items: [
                                    {
                                        id: 1,
                                        subject: 'Original Subject',
                                        excerpt: 'Original Excerpt',
                                        language: 'zh',
                                    },
                                ],
                            }),
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

            const items = spy.mock.calls[0][0].items
            expect(items.get(0).get('subject')).toBe('')
            expect(items.get(0).get('excerpt')).toBe('Translated Excerpt')
        })

        it('should handle mixed translations for multiple tickets', () => {
            mockShouldShowTranslatedContent.mockReturnValue(true)
            mockTranslationMap[1] = {
                subject: 'Translated Subject 1',
                excerpt: 'Translated Excerpt 1',
            }
            mockTranslationMap[3] = {
                subject: 'Translated Subject 3',
                excerpt: 'Translated Excerpt 3',
            }

            const spy = jest
                .spyOn(ViewTable, 'default')
                .mockImplementation(() => <div />)

            renderWithRouter(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider
                        store={mockStore({
                            tickets: fromJS({
                                items: [
                                    {
                                        id: 1,
                                        subject: 'Original Subject 1',
                                        excerpt: 'Original Excerpt 1',
                                        language: 'es',
                                    },
                                    {
                                        id: 2,
                                        subject: 'Original Subject 2',
                                        excerpt: 'Original Excerpt 2',
                                        language: 'fr',
                                    },
                                    {
                                        id: 3,
                                        subject: 'Original Subject 3',
                                        excerpt: 'Original Excerpt 3',
                                        language: 'de',
                                    },
                                ],
                            }),
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

            const items = spy.mock.calls[0][0].items
            expect(items.get(0).get('subject')).toBe('Translated Subject 1')
            expect(items.get(0).get('excerpt')).toBe('Translated Excerpt 1')
            expect(items.get(1).get('subject')).toBe('Original Subject 2')
            expect(items.get(1).get('excerpt')).toBe('Original Excerpt 2')
            expect(items.get(2).get('subject')).toBe('Translated Subject 3')
            expect(items.get(2).get('excerpt')).toBe('Translated Excerpt 3')
        })
    })

    describe('ActionComponent memoization', () => {
        it('should pass selectedItemsIds to TicketListActions', () => {
            const selectedIds = fromJS([1, 2, 3])
            const customStore = mockStore({
                tickets: fromJS({ items: [] }),
                views: fromJS({
                    active: fixtureView,
                    _internal: {
                        selectedItemsIds: selectedIds,
                    },
                }),
            })

            jest.spyOn(ViewTable, 'default').mockImplementation(
                ({
                    ActionsComponent,
                }: ComponentProps<typeof ViewTable.ViewTableContainer>) => {
                    return <div>{ActionsComponent && <ActionsComponent />}</div>
                },
            )

            renderWithRouter(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider store={customStore}>
                        <TicketList />
                    </Provider>
                </QueryClientProvider>,
            )

            expect(TicketListActionsMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    selectedItemsIds: selectedIds,
                    openMacroModal: expect.any(Function),
                }),
                {},
            )
        })

        it('should provide the same ActionsComponent reference when selectedItemsIds does not change', () => {
            const spy = jest
                .spyOn(ViewTable, 'default')
                .mockImplementation(() => <div />)

            const { rerender } = renderWithRouter(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider store={store}>
                        <TicketList />
                    </Provider>
                </QueryClientProvider>,
            )

            const firstCall = spy.mock.calls[0][0].ActionsComponent

            rerender(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider store={store}>
                        <TicketList />
                    </Provider>
                </QueryClientProvider>,
            )

            const secondCall = spy.mock.calls[1][0].ActionsComponent

            expect(firstCall).toBe(secondCall)
        })

        it('should provide a new ActionsComponent reference when selectedItemsIds changes', () => {
            const spy = jest
                .spyOn(ViewTable, 'default')
                .mockImplementation(() => <div />)

            const firstStore = mockStore({
                tickets: fromJS({ items: [] }),
                views: fromJS({
                    active: fixtureView,
                    _internal: {
                        selectedItemsIds: fromJS([1]),
                    },
                }),
            })

            const { rerender } = renderWithRouter(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider store={firstStore}>
                        <TicketList />
                    </Provider>
                </QueryClientProvider>,
            )

            const firstCall = spy.mock.calls[0][0].ActionsComponent

            const secondStore = mockStore({
                tickets: fromJS({ items: [] }),
                views: fromJS({
                    active: fixtureView,
                    _internal: {
                        selectedItemsIds: fromJS([1, 2]),
                    },
                }),
            })

            rerender(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider store={secondStore}>
                        <TicketList />
                    </Provider>
                </QueryClientProvider>,
            )

            const secondCall = spy.mock.calls[1][0].ActionsComponent

            expect(firstCall).not.toBe(secondCall)
        })
    })
})
