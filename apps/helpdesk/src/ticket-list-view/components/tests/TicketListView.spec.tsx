import type { ComponentProps, ReactElement, ReactNode } from 'react'
import { Fragment } from 'react'

import { assumeMock } from '@repo/testing'
import { act, fireEvent } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { Virtuoso } from 'react-virtuoso'
import configureMockStore from 'redux-mock-store'

import { useDesktopOnlyShowGlobalNavFeatureFlag } from 'common/navigation/hooks/useShowGlobalNavFeatureFlag'
import { ticket } from 'fixtures/ticket'
import useAppDispatch from 'hooks/useAppDispatch'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import type { RootState, StoreDispatch } from 'state/types'
import { setViewEditMode } from 'state/views/actions'
import { renderWithQueryClientAndRouter } from 'tests/renderWIthQueryClientAndRouter'
import useSelection from 'ticket-list-view/hooks/useSelection'
import useSortOrder from 'ticket-list-view/hooks/useSortOrder'
import useTickets from 'ticket-list-view/hooks/useTickets'
import type { TicketPartial } from 'ticket-list-view/types'

import Ticket from '../Ticket'
import TicketListView, { listInfoProps } from '../TicketListView'

jest.mock('react-virtuoso', () => ({ Virtuoso: jest.fn() }))
const VirtuosoMock = Virtuoso as jest.Mock

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock

jest.mock('split-ticket-view-toggle/hooks/useSplitTicketView')
const mockUseSplitTicketViewMock = useSplitTicketView as jest.Mock

jest.mock('ticket-list-view/hooks/useTickets')
const useTicketsMock = useTickets as jest.Mock

jest.mock('ticket-list-view/hooks/useSelection')
const useSelectionMock = assumeMock(useSelection)

jest.mock('ticket-list-view/hooks/useSortOrder')
const useSortOrderMock = useSortOrder as jest.Mock

jest.mock('../Ticket', () => jest.fn())
const TicketMock = Ticket as jest.Mock

jest.mock('../InvalidFiltersAction', () => () => <div>Fix filters</div>)
jest.mock('../bulk-actions/BulkActions', () => () => <div>BulkActions</div>)

jest.mock('common/navigation/hooks/useShowGlobalNavFeatureFlag')
const useDesktopOnlyShowGlobalNavFeatureFlagMock =
    useDesktopOnlyShowGlobalNavFeatureFlag as jest.Mock

const mockShouldShowTranslatedContent = jest.fn().mockReturnValue(true)
jest.mock('@repo/tickets', () => ({
    ...jest.requireActual('@repo/tickets'),
    useCurrentUserLanguagePreferences: () => ({
        shouldShowTranslatedContent: mockShouldShowTranslatedContent,
        isFetching: false,
    }),
    useTicketsTranslatedProperties: () => ({
        translationMap: {},
        updateTicketTranslatedSubject: jest.fn(),
        isInitialLoading: false,
    }),
}))

jest.mock('@repo/tickets/feature-flags', () => ({
    ...jest.requireActual('@repo/tickets/feature-flags'),
    useHelpdeskV2MS1Flag: () => false,
}))
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const view = {
    id: 123,
    name: 'view name',
}
const defaultState: Partial<RootState> = {
    views: fromJS({
        active: view,
        items: [view],
    }),
}
const store = mockStore(defaultState)

describe('<TicketListView />', () => {
    const loadMore = jest.fn()
    const pauseUpdates = jest.fn()
    const resumeUpdates = jest.fn()
    const setElement = jest.fn()
    const setIsEnabled = jest.fn()
    const setShouldRedirectToSplitView = jest.fn()
    const dispatch = jest.fn()
    const clearMock = jest.fn()

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatch)
        useSelectionMock.mockReturnValue({
            hasSelectedAll: false,
            onSelect: jest.fn(),
            onSelectAll: jest.fn(),
            selectedTickets: {},
            clear: jest.fn(),
        })
        useSortOrderMock.mockReturnValue([
            'last_message_datetime:asc',
            jest.fn(),
        ])
        VirtuosoMock.mockImplementation(
            ({
                computeItemKey,
                data,
                itemContent,
                scrollerRef,
                components: { EmptyPlaceholder, List },
            }: {
                computeItemKey: (
                    index: number,
                    ticket: TicketPartial,
                ) => number | string
                data: TicketPartial[]
                itemContent: (
                    index: number,
                    ticket: TicketPartial,
                ) => ReactElement
                scrollerRef: (ref: HTMLElement | Window | null) => void
                components: {
                    EmptyPlaceholder: () => ReactElement
                    List: ({
                        children,
                    }: {
                        children: ReactNode
                    }) => ReactElement
                }
            }) => {
                return (
                    <div ref={scrollerRef}>
                        {data.length === 0 ? (
                            <EmptyPlaceholder />
                        ) : (
                            <List>
                                {data.map((t, i) => (
                                    <Fragment key={computeItemKey(i, t)}>
                                        {itemContent(0, t)}
                                    </Fragment>
                                ))}
                            </List>
                        )}
                    </div>
                )
            },
        )
        TicketMock.mockImplementation(
            ({ ticket }: { ticket: TicketPartial }) => {
                return <p>{ticket.id}</p>
            },
        )
        useTicketsMock.mockReturnValue({
            loadMore,
            pauseUpdates,
            resumeUpdates,
            setElement,
            staleTickets: {},
            tickets: [ticket],
            newTickets: {},
            ticketIds: { current: [152] },
            initialLoaded: true,
            partials: [ticket],
        })
        mockUseSplitTicketViewMock.mockReturnValue({
            isEnabled: false,
            setIsEnabled,
            setShouldRedirectToSplitView,
        })
        useSelectionMock.mockReturnValue({
            hasSelectedAll: false,
            onSelect: jest.fn(),
            onSelectAll: jest.fn(),
            selectedTickets: {
                1: true,
                2: false,
            },
            clear: clearMock,
        })
        useDesktopOnlyShowGlobalNavFeatureFlagMock.mockReturnValue(false)
    })

    it('should pause updates when there are selected tickets', () => {
        renderWithQueryClientAndRouter(
            <Provider store={store}>
                <TicketListView viewId={123} />
            </Provider>,
        )

        expect(pauseUpdates).toHaveBeenCalledWith()
    })

    it('should resume updates when there are no selected tickets', () => {
        useSelectionMock.mockReturnValue({
            hasSelectedAll: false,
            onSelect: jest.fn(),
            onSelectAll: jest.fn(),
            selectedTickets: {},
            clear: jest.fn(),
        })
        renderWithQueryClientAndRouter(
            <Provider store={store}>
                <TicketListView viewId={123} />
            </Provider>,
        )
        expect(resumeUpdates).toHaveBeenCalledWith()
    })

    it('should clear the selection when the sort order changes', () => {
        const clear = jest.fn()
        useSelectionMock.mockReturnValue({
            clear,
            hasSelectedAll: false,
            onSelect: jest.fn(),
            onSelectAll: jest.fn(),
            selectedTickets: {},
        })

        const { rerender } = renderWithQueryClientAndRouter(
            <Provider store={store}>
                <TicketListView viewId={123} />
            </Provider>,
        )

        useSortOrderMock.mockReturnValue([
            'last_message_datetime:desc',
            jest.fn(),
        ])
        act(() => {
            rerender(
                <Provider store={store}>
                    <TicketListView viewId={123} />
                </Provider>,
            )
        })

        expect(clear).toHaveBeenCalledWith()
    })

    it('should display a list of tickets', () => {
        const { getByText } = renderWithQueryClientAndRouter(
            <Provider store={store}>
                <TicketListView viewId={123} />
            </Provider>,
        )

        expect(getByText(ticket.id)).toBeInTheDocument()
    })

    it('should register the scrolling element', () => {
        renderWithQueryClientAndRouter(
            <Provider store={store}>
                <TicketListView viewId={123} />
            </Provider>,
        )

        expect(setElement).toHaveBeenCalledWith(expect.any(HTMLElement))
    })

    it('should call loadMore when the end of the list is reached', () => {
        renderWithQueryClientAndRouter(
            <Provider store={store}>
                <TicketListView viewId={123} />
            </Provider>,
        )
        const [[{ endReached }]] = VirtuosoMock.mock.calls as [
            [{ endReached: () => void }],
        ]

        endReached()

        expect(loadMore).toHaveBeenCalledWith()
    })

    it('should mark ticket as new', () => {
        TicketMock.mockImplementation(
            ({ isNewTicket }: ComponentProps<typeof Ticket>) => {
                return <p>{String(isNewTicket)}</p>
            },
        )
        useTicketsMock.mockReturnValue({
            loadMore,
            pauseUpdates,
            resumeUpdates,
            setElement,
            staleTickets: {},
            tickets: [ticket],
            newTickets: { [ticket.id]: ticket },
            ticketIds: { current: [152] },
            partials: [ticket],
        })

        const { getByText } = renderWithQueryClientAndRouter(
            <Provider store={store}>
                <TicketListView viewId={123} />
            </Provider>,
        )

        expect(getByText('true')).toBeInTheDocument()
    })

    it('should flip exit transition prop for removed ticket', () => {
        const newTickets = [ticket, { ...ticket, id: 456 }]
        TicketMock.mockImplementation(
            ({ exit }: ComponentProps<typeof Ticket>) => {
                return <p>{String(exit)}</p>
            },
        )
        VirtuosoMock.mockImplementation(
            ({
                itemContent,
                scrollerRef,
                components: { Item },
            }: {
                itemContent: (
                    index: number,
                    ticket: ComponentProps<typeof Ticket>['ticket'],
                ) => ReactElement
                scrollerRef: (ref: HTMLElement | Window | null) => void
                components: { Item: (props: any) => ReactElement }
            }) => {
                return (
                    <div ref={scrollerRef}>
                        {newTickets.map((t) => (
                            <Item key={t.id}>{itemContent(0, t)}</Item>
                        ))}
                    </div>
                )
            },
        )
        useTicketsMock.mockReturnValue({
            loadMore,
            pauseUpdates,
            resumeUpdates,
            setElement,
            staleTickets: {},
            tickets: [ticket, { ...ticket, id: 456 }],
            newTickets: {},
            ticketIds: { current: [152, 456] },
            partials: [ticket, { ...ticket, id: 456 }],
        })

        const { rerender, getByText } = renderWithQueryClientAndRouter(
            <Provider store={store}>
                <TicketListView viewId={123} />
            </Provider>,
        )
        useTicketsMock.mockReturnValue({
            loadMore,
            pauseUpdates,
            resumeUpdates,
            setElement,
            staleTickets: {},
            tickets: [ticket],
            newTickets: [],
            ticketIds: { current: [152] },
            partials: [ticket],
        })
        rerender(
            <Provider store={store}>
                <TicketListView viewId={123} />
            </Provider>,
        )
        rerender(
            <Provider store={store}>
                <TicketListView viewId={123} />
            </Provider>,
        )

        expect(getByText('true')).toBeInTheDocument()
    })

    it('should render empty placeholder', () => {
        useTicketsMock.mockReturnValue({
            loadMore,
            pauseUpdates,
            resumeUpdates,
            setElement,
            staleTickets: {},
            tickets: [],
            newTickets: {},
            ticketIds: { current: [] },
            initialLoaded: true,
            partials: [],
        })

        const { getByText } = renderWithQueryClientAndRouter(
            <Provider store={store}>
                <TicketListView viewId={123} />
            </Provider>,
        )

        expect(getByText(listInfoProps.DEFAULT.text)).toBeInTheDocument()
        expect(getByText(listInfoProps.DEFAULT.subText)).toBeInTheDocument()
    })

    it('should render invalid view filters placeholder', () => {
        useTicketsMock.mockReturnValue({
            loadMore,
            pauseUpdates,
            resumeUpdates,
            setElement,
            staleTickets: {},
            tickets: [],
            newTickets: {},
            ticketIds: { current: [] },
            initialLoaded: true,
            partials: [],
        })

        const deactivatedView = {
            ...view,
            deactivated_datetime: '2021-01-01T00:00:00Z',
        }
        const { getByText } = renderWithQueryClientAndRouter(
            <Provider
                store={mockStore({
                    views: fromJS({
                        active: deactivatedView,
                        items: [deactivatedView],
                    }),
                })}
            >
                <TicketListView viewId={123} />
            </Provider>,
        )

        expect(
            getByText(listInfoProps.INVALID_FILTERS.text),
        ).toBeInTheDocument()
        expect(
            getByText(listInfoProps.INVALID_FILTERS.subText, {
                trim: false,
                collapseWhitespace: false,
            }),
        ).toBeInTheDocument()
        expect(getByText('Fix filters')).toBeInTheDocument()
    })

    it('should render inaccessible view placeholder', () => {
        useTicketsMock.mockReturnValue({
            loadMore,
            pauseUpdates,
            resumeUpdates,
            setElement,
            staleTickets: {},
            tickets: [],
            newTickets: {},
            ticketIds: { current: [] },
            initialLoaded: true,
            partials: [],
        })

        const { getByText } = renderWithQueryClientAndRouter(
            <Provider
                store={mockStore({
                    views: fromJS({
                        active: null,
                    }),
                })}
            >
                <TicketListView viewId={123} />
            </Provider>,
        )

        expect(getByText(listInfoProps.INACCESSIBLE.text)).toBeInTheDocument()
        expect(
            getByText(listInfoProps.INACCESSIBLE.subText),
        ).toBeInTheDocument()
    })

    it('should redirect to edition view', () => {
        const { getByText } = renderWithQueryClientAndRouter(
            <Provider
                store={mockStore({
                    views: fromJS({
                        active: null,
                    }),
                })}
            >
                <TicketListView viewId={123} />
            </Provider>,
        )
        fireEvent.click(getByText('tune'))

        expect(dispatch).toHaveBeenCalledWith(setViewEditMode())
        expect(setIsEnabled).toHaveBeenCalledWith(false)
        expect(setShouldRedirectToSplitView).toHaveBeenCalledWith(true)
    })

    it('should display bulk actions', () => {
        const { getByText } = renderWithQueryClientAndRouter(
            <Provider store={store}>
                <TicketListView viewId={123} />
            </Provider>,
        )

        expect(getByText('BulkActions')).toBeInTheDocument()
    })

    it('should hide bulk actions for view with count 0', () => {
        const { queryByText } = renderWithQueryClientAndRouter(
            <Provider
                store={mockStore({
                    views: fromJS({
                        active: view,
                        items: [view],
                        counts: {
                            [view.id]: 0,
                        },
                    }),
                })}
            >
                <TicketListView viewId={123} />
            </Provider>,
        )

        expect(queryByText('BulkActions')).not.toBeInTheDocument()
    })

    describe('selectionCount', () => {
        it('should display select all when nothing is selected', () => {
            useSelectionMock.mockReturnValue({
                hasSelectedAll: false,
                onSelect: jest.fn(),
                onSelectAll: jest.fn(),
                selectedTickets: {},
                clear: jest.fn(),
            })

            const { getByText } = renderWithQueryClientAndRouter(
                <Provider store={store}>
                    <TicketListView viewId={123} />
                </Provider>,
            )

            expect(getByText('Select all')).toBeInTheDocument()
        })

        it('should display unknown ticket count when not available (null)', () => {
            useSelectionMock.mockReturnValue({
                hasSelectedAll: true,
                onSelect: jest.fn(),
                onSelectAll: jest.fn(),
                selectedTickets: {},
                clear: jest.fn(),
            })

            const { getByText } = renderWithQueryClientAndRouter(
                <Provider store={store}>
                    <TicketListView viewId={123} />
                </Provider>,
            )

            expect(getByText('? selected')).toBeInTheDocument()
        })

        it('should display ticket count when available', () => {
            useSelectionMock.mockReturnValue({
                hasSelectedAll: true,
                onSelect: jest.fn(),
                onSelectAll: jest.fn(),
                selectedTickets: {},
                clear: jest.fn(),
            })

            const { getByText } = renderWithQueryClientAndRouter(
                <Provider
                    store={mockStore({
                        views: fromJS({
                            active: view,
                            items: [view],
                            counts: {
                                123: 7,
                            },
                        }),
                    })}
                >
                    <TicketListView viewId={123} />
                </Provider>,
            )

            expect(getByText('7 selected')).toBeInTheDocument()
        })

        it('should display number of selected tickets as ticket count', () => {
            useSelectionMock.mockReturnValue({
                hasSelectedAll: false,
                onSelect: jest.fn(),
                onSelectAll: jest.fn(),
                selectedTickets: {
                    88: true,
                },
                clear: jest.fn(),
            })

            const { getByText } = renderWithQueryClientAndRouter(
                <Provider store={store}>
                    <TicketListView viewId={123} />
                </Provider>,
            )

            expect(getByText('1 selected')).toBeInTheDocument()
        })
    })

    describe('translations', () => {
        it('should pass undefined translation when no translation exists', () => {
            useTicketsMock.mockReturnValue({
                loadMore,
                pauseUpdates,
                resumeUpdates,
                setElement,
                staleTickets: {},
                tickets: [ticket],
                newTickets: {},
                ticketIds: { current: [152] },
                initialLoaded: true,
                partials: [ticket],
            })

            renderWithQueryClientAndRouter(
                <Provider store={store}>
                    <TicketListView viewId={123} />
                </Provider>,
            )

            expect(TicketMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    ticket,
                    translation: undefined,
                }),
                {},
            )
        })

        it('should fetch translations for all partial tickets', () => {
            const mockPartials = [
                { id: 1, subject: 'Subject 1' },
                { id: 2, subject: 'Subject 2' },
                { id: 3, subject: 'Subject 3' },
            ]

            useTicketsMock.mockReturnValue({
                loadMore,
                pauseUpdates,
                resumeUpdates,
                setElement,
                staleTickets: {},
                tickets: mockPartials,
                newTickets: {},
                ticketIds: { current: [1, 2, 3] },
                initialLoaded: true,
                partials: mockPartials,
            })

            renderWithQueryClientAndRouter(
                <Provider store={store}>
                    <TicketListView viewId={123} />
                </Provider>,
            )

            expect(TicketMock).toHaveBeenCalledTimes(3)
        })

        it('should pass translation from translationMap to each ticket', () => {
            const mockTickets = [
                { id: 1, subject: 'Subject 1' },
                { id: 2, subject: 'Subject 2' },
            ]

            useTicketsMock.mockReturnValue({
                loadMore,
                pauseUpdates,
                resumeUpdates,
                setElement,
                staleTickets: {},
                tickets: mockTickets,
                newTickets: {},
                ticketIds: { current: [1, 2] },
                initialLoaded: true,
                partials: mockTickets,
            })

            renderWithQueryClientAndRouter(
                <Provider store={store}>
                    <TicketListView viewId={123} />
                </Provider>,
            )

            expect(TicketMock).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    ticket: mockTickets[0],
                    translation: undefined,
                }),
                {},
            )
            expect(TicketMock).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining({
                    ticket: mockTickets[1],
                    translation: undefined,
                }),
                {},
            )
        })

        it('should update translations when partials change', () => {
            const initialPartials = [{ id: 1, subject: 'Subject 1' }]
            const updatedPartials = [
                { id: 1, subject: 'Subject 1' },
                { id: 2, subject: 'Subject 2' },
            ]

            useTicketsMock.mockReturnValue({
                loadMore,
                pauseUpdates,
                resumeUpdates,
                setElement,
                staleTickets: {},
                tickets: initialPartials,
                newTickets: {},
                ticketIds: { current: [1] },
                initialLoaded: true,
                partials: initialPartials,
            })

            const { rerender } = renderWithQueryClientAndRouter(
                <Provider store={store}>
                    <TicketListView viewId={123} />
                </Provider>,
            )

            expect(TicketMock).toHaveBeenCalledTimes(1)

            useTicketsMock.mockReturnValue({
                loadMore,
                pauseUpdates,
                resumeUpdates,
                setElement,
                staleTickets: {},
                tickets: updatedPartials,
                newTickets: {},
                ticketIds: { current: [1, 2] },
                initialLoaded: true,
                partials: updatedPartials,
            })

            rerender(
                <Provider store={store}>
                    <TicketListView viewId={123} />
                </Provider>,
            )

            expect(TicketMock).toHaveBeenCalledTimes(3)
        })

        it('should handle empty partials array', () => {
            useTicketsMock.mockReturnValue({
                loadMore,
                pauseUpdates,
                resumeUpdates,
                setElement,
                staleTickets: {},
                tickets: [],
                newTickets: {},
                ticketIds: { current: [] },
                initialLoaded: true,
                partials: [],
            })

            renderWithQueryClientAndRouter(
                <Provider store={store}>
                    <TicketListView viewId={123} />
                </Provider>,
            )

            expect(TicketMock).not.toHaveBeenCalled()
        })
    })
})
