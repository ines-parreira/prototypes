import React from 'react'

import { Panels } from '@repo/layout'
import { useSearchRankScenario } from '@repo/logging'
import { assumeMock, render } from '@repo/testing'
import { useHelpdeskV2MS4Dot5Flag } from '@repo/tickets/feature-flags'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { compressToEncodedURIComponent } from 'lz-string'
import { useHistory, useLocation } from 'react-router-dom'

import { useGetView } from '@gorgias/helpdesk-queries'

import { BASE_VIEW_ID } from 'constants/view'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { ViewField, ViewVisibility } from 'models/view/types'
import type { StoreState } from 'state/types'
import { resetView, setViewActive, setViewEditMode } from 'state/views/actions'

import { ViewPanelEntrypoint } from '../ViewPanelEntrypoint'

jest.mock('config/views', () => ({
    getConfigByType: jest.fn(() => ({
        get: jest.fn((key: string) => {
            if (key !== 'newView') {
                return undefined
            }

            return (visibility?: ViewVisibility) =>
                fromJS({
                    id: BASE_VIEW_ID,
                    type: 'ticket-list',
                    visibility,
                    name: 'New view',
                    slug: 'new-view',
                    filters: '',
                    search: '',
                    fields: [
                        ViewField.Details,
                        ViewField.Channel,
                        ViewField.Assignee,
                        ViewField.Status,
                        ViewField.Customer,
                        ViewField.Created,
                        ViewField.LastMessage,
                    ],
                })
        }),
    })),
    getConfigByName: jest.fn(() => ({
        get: jest.fn((key: string) => {
            if (key !== 'searchView') {
                return undefined
            }

            return (search = '', filters = '') =>
                fromJS({
                    id: BASE_VIEW_ID,
                    type: 'ticket-list',
                    name: 'Search',
                    slug: 'search',
                    search,
                    filters,
                })
        }),
    })),
}))

jest.mock('@repo/tickets/feature-flags', () => ({
    useHelpdeskV2MS4Dot5Flag: jest.fn(),
}))
const useHelpdeskV2MS4Dot5FlagMock = assumeMock(useHelpdeskV2MS4Dot5Flag)

jest.mock('@gorgias/helpdesk-queries', () => ({
    useGetView: jest.fn(),
}))
const useGetViewMock = assumeMock(useGetView)

const replaceMock = jest.fn()
const pushMock = jest.fn()
let mockViewId = 123456
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(),
    useLocation: jest.fn(),
}))
const useHistoryMock = assumeMock(useHistory)
const useLocationMock = assumeMock(useLocation)

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: jest.fn(),
}))
jest.mock('@repo/logging', () => ({
    __esModule: true,
    default: jest.fn(),
    useSearchRankScenario: jest.fn(),
    SearchRankSource: {
        TicketsView: 'tickets_view',
    },
}))
jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(),
}))
const useAppDispatchMock = assumeMock(useAppDispatch)
const useSearchRankScenarioMock = assumeMock(useSearchRankScenario)
const useAppSelectorMock = assumeMock(useAppSelector)

jest.mock('state/views/selectors', () => ({
    areFiltersValid: jest.fn(),
    areFiltersValidAst: jest.fn(),
    getActiveView: jest.fn(),
    getNavigation: jest.fn(),
    getViewPlainJS: jest.fn(),
    isDirty: jest.fn(),
    isEditMode: jest.fn(),
}))
const {
    areFiltersValid: getAreFiltersValid,
    areFiltersValidAst: getAreFiltersValidAst,
    getActiveView,
    getNavigation,
    getViewPlainJS,
    isDirty: getIsDirty,
    isEditMode: getIsEditMode,
} = jest.requireMock('state/views/selectors') as {
    areFiltersValid: jest.Mock
    areFiltersValidAst: jest.Mock
    getActiveView: jest.Mock
    getNavigation: jest.Mock
    getViewPlainJS: jest.Mock
    isDirty: jest.Mock
    isEditMode: jest.Mock
}

jest.mock('state/views/actions', () => ({
    resetView: jest.fn(),
    setViewActive: jest.fn(),
    setViewEditMode: jest.fn(),
}))
const resetViewMock = assumeMock(resetView)
const setViewActiveMock = assumeMock(setViewActive)
const setViewEditModeMock = assumeMock(setViewEditMode)

type DirtyViewProps = {
    enabled: boolean
    search: string
    filters: string
    areFiltersValid: boolean
}

type MockViewPanelProps = {
    viewId: number
    isSearchMode?: boolean
    onSearchResultCountChange?: (count?: number) => void
    onExpand?: () => void
    onEditView?: () => void
    onFixFilters?: () => void
    onNavigateToTicket?: () => void
    onApplyMacro?: (ticketIds: number[]) => void
    settingsContent?: React.ReactNode
    isSettingsExpanded?: boolean
    onSettingsExpandedChange?: (isExpanded: boolean) => void
    titleOverride?: string
    hideCreateTicket?: boolean
    isDraftView?: boolean
    dirtyView?: DirtyViewProps
    draftFields?: ViewField[]
    onDraftFieldsChange?: (fields: ViewField[]) => void
    searchTracking?: {
        onRequest?: (request: { query: string; requestTime: number }) => void
        onResponse?: (response: {
            responseTime: number
            numberOfResults: number
            searchEngine?: string
        }) => void
        onSelection?: (selection: {
            id: number | string
            index: number
        }) => void
    }
}

function buildCallExpressionAst(operator: string, right: unknown) {
    return fromJS({
        type: 'Program',
        body: [
            {
                type: 'ExpressionStatement',
                expression: {
                    type: 'CallExpression',
                    callee: { name: operator },
                    arguments: [
                        {
                            type: 'Identifier',
                            name: 'ticket.channel',
                        },
                        {
                            type: 'Literal',
                            value: right,
                        },
                    ],
                },
            },
        ],
    })
}

function getLastSetViewEditModeDraftView() {
    const draftView = setViewEditModeMock.mock.calls.at(-1)?.[0]

    if (!draftView) {
        throw new Error(
            'Expected setViewEditMode to be called with a draft view',
        )
    }

    return draftView
}

function mockUseGetViewResult(data?: unknown) {
    return {
        data,
    } as unknown as ReturnType<typeof useGetView>
}

function mockSelectors({
    view = null,
    currentActiveView,
    navigation = fromJS({}),
    isDirty = false,
    isEditMode = false,
    areFiltersValid = true,
    areFiltersValidAst = true,
}: {
    view?: unknown
    currentActiveView?: unknown
    navigation?: unknown
    isDirty?: boolean
    isEditMode?: boolean
    areFiltersValid?: boolean
    areFiltersValidAst?: boolean
} = {}) {
    getViewPlainJS.mockReturnValue(view)
    getActiveView.mockReturnValue(currentActiveView)
    getNavigation.mockReturnValue(navigation)
    getIsDirty.mockReturnValue(isDirty)
    getIsEditMode.mockReturnValue(isEditMode)
    getAreFiltersValid.mockReturnValue(areFiltersValid)
    getAreFiltersValidAst.mockReturnValue(areFiltersValidAst)
    useAppSelectorMock.mockImplementation((selector) =>
        selector({} as StoreState),
    )
}

const mockViewPanel = jest.fn((props: MockViewPanelProps) => {
    const {
        viewId,
        isSearchMode,
        onSearchResultCountChange,
        onExpand,
        onApplyMacro,
        settingsContent,
        isSettingsExpanded,
        titleOverride,
        hideCreateTicket,
        isDraftView,
        dirtyView,
    } = props

    return (
        <div>
            <p>ViewPanel</p>
            <p>viewId: {viewId}</p>
            <p>titleOverride: {titleOverride ?? 'none'}</p>
            <p>hideCreateTicket: {String(hideCreateTicket)}</p>
            <p>isDraftView: {String(isDraftView)}</p>
            <p>dirtyView: {JSON.stringify(dirtyView)}</p>
            <p>draftFields: {JSON.stringify(props.draftFields ?? [])}</p>
            <p>isSearchMode: {String(isSearchMode)}</p>
            <p>isSettingsExpanded: {String(isSettingsExpanded)}</p>
            <button onClick={() => onSearchResultCountChange?.(200)}>
                Set search count
            </button>
            <button onClick={onExpand}>Expand</button>
            <button onClick={props.onEditView}>Edit view</button>
            <button onClick={() => onApplyMacro?.([1, 2, 3])}>
                Open macro
            </button>
            <button
                onClick={() => props.onDraftFieldsChange?.([ViewField.Subject])}
            >
                Change draft fields
            </button>
            {settingsContent}
        </div>
    )
})

jest.mock('@repo/tickets/views', () => ({
    ViewPanel: (props: MockViewPanelProps) => mockViewPanel(props),
}))

jest.mock('ticket-list-view/components/bulk-actions/ApplyMacro', () => ({
    __esModule: true,
    default: ({
        ticketIds,
        onApplyMacro,
        setIsOpen,
    }: {
        ticketIds: number[]
        onApplyMacro: () => void
        setIsOpen: (v: boolean) => void
    }) => (
        <div>
            <p>ApplyMacro</p>
            <p>ticketIds: {ticketIds.join(',')}</p>
            <button onClick={onApplyMacro}>Apply macro</button>
            <button onClick={() => setIsOpen(false)}>Close macro</button>
        </div>
    ),
}))

jest.mock('../ViewPanel', () => ({
    __esModule: true,
    default: () => <div>LegacyViewPanel</div>,
}))

jest.mock('tickets/core/hooks', () => ({ useViewId: () => mockViewId }))

const setIsEnabledMock = jest.fn()
jest.mock('split-ticket-view-toggle', () => ({
    useSplitTicketView: () => ({ setIsEnabled: setIsEnabledMock }),
}))

const mockViewPanelFiltersBridge = jest.fn(
    ({
        draftFields,
        isExpanded,
        isSearchMode,
        hideViewNameInput: __hideViewNameInput,
        hideFooterActions: __hideFooterActions,
        title: __title,
        searchResultCount,
    }: {
        isExpanded?: boolean
        isSearchMode?: boolean
        hideViewNameInput?: boolean
        hideFooterActions?: boolean
        title?: string
        searchResultCount?: number
        draftFields?: ViewField[]
    }) => (
        <div>
            <p>ViewPanelFiltersBridge rendered</p>
            <p>ViewPanelFiltersBridge expanded: {String(isExpanded)}</p>
            <p>
                ViewPanelFiltersBridge draftFields:{' '}
                {JSON.stringify(draftFields ?? [])}
            </p>
            <p>ViewPanelFiltersBridge search: {String(isSearchMode)}</p>
            <p>ViewPanelFiltersBridge count: {String(searchResultCount)}</p>
        </div>
    ),
)

jest.mock('../ViewPanelFiltersBridge', () => ({
    ViewPanelFiltersBridge: (props: {
        isExpanded?: boolean
        isSearchMode?: boolean
        hideViewNameInput?: boolean
        hideFooterActions?: boolean
        title?: string
        searchResultCount?: number
        draftFields?: ViewField[]
    }) => mockViewPanelFiltersBridge(props),
}))

describe('ViewPanelEntrypoint', () => {
    const dispatchMock = jest.fn()
    const searchRankScenario = {
        isRunning: false,
        registerResultsRequest: jest.fn(),
        registerResultsResponse: jest.fn(),
        registerResultSelection: jest.fn(),
        endScenario: jest.fn(),
    }
    const setViewActiveAction = jest.fn() as unknown as ReturnType<
        typeof setViewActive
    >
    const resetViewAction: ReturnType<typeof resetView> = {
        type: 'RESET_VIEW',
        configName: undefined,
    }
    const setViewEditModeAction: ReturnType<typeof setViewEditMode> = {
        type: 'SET_VIEW_EDIT_MODE',
        view: undefined,
    }
    const persistedView = {
        id: 123456,
        type: 'ticket-list',
        name: 'Fresh name',
        search: 'test search',
        filters: 'status:open',
    }
    const activeView = fromJS({
        search: 'test search',
        filters: 'status:open',
    })

    beforeEach(() => {
        mockViewId = 123456
        setIsEnabledMock.mockReset()
        replaceMock.mockReset()
        pushMock.mockReset()
        dispatchMock.mockReset()
        mockViewPanel.mockClear()
        mockViewPanelFiltersBridge.mockClear()
        searchRankScenario.registerResultsRequest.mockReset()
        searchRankScenario.registerResultsResponse.mockReset()
        searchRankScenario.registerResultSelection.mockReset()
        searchRankScenario.endScenario.mockReset()
        useAppDispatchMock.mockReturnValue(dispatchMock)
        useSearchRankScenarioMock.mockReturnValue(searchRankScenario)
        useHistoryMock.mockReturnValue({
            replace: replaceMock,
            push: pushMock,
        } as unknown as ReturnType<typeof useHistory>)
        useLocationMock.mockReturnValue({
            pathname: '/app/views/123456',
            state: undefined,
        } as ReturnType<typeof useLocation>)
        useGetViewMock.mockReturnValue(
            mockUseGetViewResult({ data: persistedView }),
        )
        useAppSelectorMock.mockReset()
        getViewPlainJS.mockReset()
        getActiveView.mockReset()
        getIsDirty.mockReset()
        getIsEditMode.mockReset()
        getAreFiltersValid.mockReset()
        mockSelectors({ currentActiveView: activeView })
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(false)
        resetViewMock.mockReturnValue(resetViewAction)
        setViewActiveMock.mockReturnValue(setViewActiveAction)
        setViewEditModeMock.mockReturnValue(setViewEditModeAction)
    })

    it('should render LegacyViewPanel when MS4.5 flag is disabled', () => {
        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )
        expect(screen.getByText('LegacyViewPanel')).toBeInTheDocument()
        expect(screen.queryByText('ViewPanel')).not.toBeInTheDocument()
    })

    it('should render ViewPanel when MS4.5 flag is enabled', () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )
        expect(screen.getByText('ViewPanel')).toBeInTheDocument()
        expect(screen.getByText('viewId: 123456')).toBeInTheDocument()
        expect(screen.getByText('titleOverride: none')).toBeInTheDocument()
        expect(screen.getByText('hideCreateTicket: false')).toBeInTheDocument()
        expect(screen.getByText('isDraftView: false')).toBeInTheDocument()
        expect(
            screen.getByText(
                'dirtyView: {"enabled":false,"search":"test search","filters":"status:open","areFiltersValid":true}',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText('isSettingsExpanded: false'),
        ).toBeInTheDocument()
        expect(screen.queryByText('LegacyViewPanel')).not.toBeInTheDocument()
    })

    it('should enable search mode on /app/tickets/search', async () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        useLocationMock.mockReturnValue({
            pathname: '/app/tickets/search',
            search: '?q=hello',
            state: undefined,
        } as ReturnType<typeof useLocation>)

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        expect(screen.getByText('isSearchMode: true')).toBeInTheDocument()
        expect(
            screen.getByText('titleOverride: Advanced search'),
        ).toBeInTheDocument()
        expect(screen.getByText('hideCreateTicket: true')).toBeInTheDocument()
        await waitFor(() => {
            expect(setViewActiveMock).toHaveBeenCalled()
        })
        expect(setIsEnabledMock).toHaveBeenCalledWith(false)
        expect(
            mockViewPanel.mock.calls.at(-1)?.[0]?.onNavigateToTicket,
        ).toEqual(expect.any(Function))
        expect(mockViewPanel.mock.calls.at(-1)?.[0]?.searchTracking).toEqual(
            expect.objectContaining({
                onRequest: expect.any(Function),
                onResponse: expect.any(Function),
                onSelection: expect.any(Function),
            }),
        )
    })

    it('bridges search tracking callbacks to the legacy search-rank scenario', () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        useLocationMock.mockReturnValue({
            pathname: '/app/tickets/search',
            search: '?q=hello',
            state: undefined,
        } as ReturnType<typeof useLocation>)

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        const searchTracking =
            mockViewPanel.mock.calls.at(-1)?.[0]?.searchTracking

        expect(searchTracking).toEqual(
            expect.objectContaining({
                onRequest: expect.any(Function),
                onResponse: expect.any(Function),
                onSelection: expect.any(Function),
            }),
        )

        searchTracking?.onRequest?.({
            query: 'hello',
            requestTime: 123,
        })
        searchTracking?.onResponse?.({
            responseTime: 456,
            numberOfResults: 7,
            searchEngine: 'PG',
        })
        searchTracking?.onSelection?.({
            id: 42,
            index: 2,
        })

        expect(searchRankScenario.registerResultsRequest).toHaveBeenCalledWith({
            query: 'hello',
            requestTime: 123,
        })
        expect(searchRankScenario.registerResultsResponse).toHaveBeenCalledWith(
            {
                responseTime: 456,
                numberOfResults: 7,
                searchEngine: 'PG',
            },
        )
        expect(searchRankScenario.registerResultSelection).toHaveBeenCalledWith(
            {
                id: 42,
                index: 2,
            },
        )
    })

    it('shows the filters bridge open on initial search load', () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        useLocationMock.mockReturnValue({
            pathname: '/app/tickets/search',
            search: '?q=hello',
            state: undefined,
        } as ReturnType<typeof useLocation>)

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        expect(screen.getByText('isSettingsExpanded: true')).toBeInTheDocument()
    })

    it('does not rehydrate the search view from the URL while editing filters', () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        useLocationMock.mockReturnValue({
            pathname: '/app/tickets/search',
            search: '?q=hello',
            state: undefined,
        } as ReturnType<typeof useLocation>)
        mockSelectors({
            currentActiveView: fromJS({
                search: 'draft change',
                filters: "eq(ticket.channel, 'chat')",
            }),
            isEditMode: true,
        })

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        expect(setViewActiveMock).not.toHaveBeenCalled()
    })

    it('hydrates the synthetic search view when entering /search from another edited view', async () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        useLocationMock.mockReturnValue({
            pathname: '/app/tickets/search',
            search: '?q=hello',
            state: undefined,
        } as ReturnType<typeof useLocation>)
        mockSelectors({
            currentActiveView: fromJS({
                id: 999,
                name: 'Open tickets',
                search: null,
                filters: "eq(ticket.status, 'open')",
                editMode: true,
            }),
            isEditMode: true,
        })

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        await waitFor(() => {
            expect(setViewActiveMock).toHaveBeenCalled()
        })
    })

    it('syncs valid search filters back to the URL', async () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        useLocationMock.mockReturnValue({
            pathname: '/app/tickets/search',
            search: '?q=hello',
            state: undefined,
        } as ReturnType<typeof useLocation>)
        mockSelectors({
            currentActiveView: fromJS({
                id: BASE_VIEW_ID,
                name: 'Search',
                search: 'hello',
                filters: "eq(ticket.channel, 'chat')",
            }),
            isEditMode: true,
        })

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    pathname: '/app/tickets/search',
                    search: expect.stringContaining('q=hello'),
                }),
            )
        })
        expect(pushMock).toHaveBeenCalledWith(
            expect.objectContaining({
                pathname: '/app/tickets/search',
                search: expect.stringContaining('filters='),
            }),
        )
    })

    it.each([true, false])(
        'does not strip a filtered search URL from a stale empty search view when MS4.5 is %s',
        async (isMS4Dot5Enabled) => {
            const encodedFilters = compressToEncodedURIComponent(
                "eq(ticket.channel, 'chat')",
            )

            useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(isMS4Dot5Enabled)
            useLocationMock.mockReturnValue({
                pathname: '/app/tickets/search',
                search: `?filters=${encodedFilters}`,
                state: undefined,
            } as ReturnType<typeof useLocation>)
            mockSelectors({
                currentActiveView: fromJS({
                    id: BASE_VIEW_ID,
                    name: 'Search',
                    search: '',
                    filters: '',
                }),
                isEditMode: false,
            })

            render(
                <Panels size={1000}>
                    <ViewPanelEntrypoint />
                </Panels>,
            )

            await waitFor(() => {
                expect(pushMock).not.toHaveBeenCalled()
            })

            if (isMS4Dot5Enabled) {
                expect(setViewActiveMock).toHaveBeenCalled()
            } else {
                expect(setViewActiveMock).not.toHaveBeenCalled()
            }
        },
    )

    it('removes empty search params from the URL in search mode', async () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        useLocationMock.mockReturnValue({
            pathname: '/app/tickets/search',
            search: `?q=hello&filters=${compressToEncodedURIComponent("eq(ticket.channel, 'chat')")}`,
            state: undefined,
        } as ReturnType<typeof useLocation>)
        mockSelectors({
            currentActiveView: fromJS({
                id: BASE_VIEW_ID,
                name: 'Search',
                search: '',
                filters: '',
            }),
            isEditMode: true,
        })

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    pathname: '/app/tickets/search',
                    search: '',
                }),
            )
        })
    })

    it('does not sync invalid search filters back to the URL', async () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        useLocationMock.mockReturnValue({
            pathname: '/app/tickets/search',
            search: '?q=hello',
            state: undefined,
        } as ReturnType<typeof useLocation>)
        mockSelectors({
            currentActiveView: fromJS({
                id: BASE_VIEW_ID,
                name: 'Search',
                search: 'hello',
                filters: "eq(ticket.channel, '')",
            }),
            isEditMode: true,
            areFiltersValid: false,
        })

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        await waitFor(() => {
            expect(pushMock).not.toHaveBeenCalled()
        })
    })

    it('should call setIsEnabled(true) when onExpand is triggered', async () => {
        const user = userEvent.setup()
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )
        await user.click(screen.getByRole('button', { name: 'Expand' }))
        expect(setIsEnabledMock).toHaveBeenCalledWith(true)
    })

    it('should call setIsEnabled(false) when a ticket is opened from the table', () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        const props = mockViewPanel.mock.calls.at(-1)?.[0]
        act(() => {
            props?.onNavigateToTicket?.()
        })

        expect(setIsEnabledMock).toHaveBeenCalledWith(false)
    })

    it('should open filters in edit mode when onEditView is triggered', () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )
        const initialProps = mockViewPanel.mock.calls[0]?.[0]
        initialProps?.onEditView?.()
        expect(setViewEditModeMock).toHaveBeenCalledWith(fromJS(persistedView))
        expect(dispatchMock).toHaveBeenCalledWith(setViewEditModeAction)
    })

    it('should open search filters from the synthetic search view', () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        useLocationMock.mockReturnValue({
            pathname: '/app/tickets/search',
            search: '?q=hello',
            state: undefined,
        } as ReturnType<typeof useLocation>)

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        // Search mode auto-expands the filters, so the first toggle collapses
        // them. The second toggle re-opens with the synthetic search view.
        act(() => {
            mockViewPanel.mock.calls.at(-1)?.[0]?.onEditView?.()
        })
        act(() => {
            mockViewPanel.mock.calls.at(-1)?.[0]?.onEditView?.()
        })

        const draftView = getLastSetViewEditModeDraftView()
        expect(draftView.get('id')).toBe(BASE_VIEW_ID)
        expect(draftView.get('name')).toBe('Search')
        expect(draftView.get('search')).toBe('hello')
        expect(draftView.get('filters')).toBe('')
    })

    it('should render the bridge when the view is in edit mode', () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        mockSelectors({ currentActiveView: activeView, isEditMode: true })

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        expect(
            screen.getByText('ViewPanelFiltersBridge expanded: false'),
        ).toBeInTheDocument()
    })

    it('should render search filters bridge chrome for search mode', () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        useLocationMock.mockReturnValue({
            pathname: '/app/tickets/search',
            search: '?q=hello',
            state: undefined,
        } as ReturnType<typeof useLocation>)
        mockSelectors({
            currentActiveView: fromJS({
                id: BASE_VIEW_ID,
                name: 'Search',
                search: 'hello',
                filters: '',
            }),
            isEditMode: true,
        })

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        const props = mockViewPanel.mock.calls.at(-1)?.[0]
        act(() => {
            props?.onSearchResultCountChange?.(200)
        })

        expect(mockViewPanelFiltersBridge).toHaveBeenCalledWith(
            expect.objectContaining({
                isExpanded: true,
                isSearchMode: true,
                hideViewNameInput: true,
                hideFooterActions: true,
                searchResultCount: 200,
            }),
        )
        expect(
            screen.getByText('ViewPanelFiltersBridge count: 200'),
        ).toBeInTheDocument()
    })

    it('should open the disclosure from route state and clear the one-shot flag', async () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        useLocationMock.mockReturnValue({
            pathname: '/app/views/123456',
            state: { openViewFilters: true },
        } as ReturnType<typeof useLocation>)
        mockSelectors({ currentActiveView: activeView, isEditMode: true })

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        await waitFor(() => {
            expect(setViewEditModeMock).toHaveBeenCalledWith(
                fromJS(persistedView),
            )
        })
        await waitFor(() => {
            expect(
                screen.getByText('isSettingsExpanded: true'),
            ).toBeInTheDocument()
        })
        expect(replaceMock).toHaveBeenCalledWith('/app/views/123456', {
            openViewFilters: false,
        })
    })

    it('should close filters when onEditView is triggered a second time', async () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        act(() => {
            mockViewPanel.mock.calls.at(-1)?.[0]?.onEditView?.()
        })
        act(() => {
            mockViewPanel.mock.calls.at(-1)?.[0]?.onEditView?.()
        })

        expect(dispatchMock).toHaveBeenCalledWith(resetViewAction)
    })

    it('should reopen the disclosure when onFixFilters is triggered in edit mode', async () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        mockSelectors({ currentActiveView: activeView, isEditMode: true })

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        expect(
            screen.getByText('ViewPanelFiltersBridge expanded: false'),
        ).toBeInTheDocument()

        const props = mockViewPanel.mock.calls.at(-1)?.[0]
        act(() => {
            props?.onFixFilters?.()
        })

        expect(dispatchMock).not.toHaveBeenCalledWith(resetViewAction)
        await waitFor(() => {
            expect(
                screen.getByText('isSettingsExpanded: true'),
            ).toBeInTheDocument()
        })
    })

    it('should enter edit mode and open the disclosure when onFixFilters is triggered while closed', async () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        mockSelectors({ currentActiveView: activeView, isEditMode: false })
        getIsEditMode.mockImplementation(() =>
            dispatchMock.mock.calls.some(
                ([action]) => action === setViewEditModeAction,
            ),
        )

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        const props = mockViewPanel.mock.calls.at(-1)?.[0]
        act(() => {
            props?.onFixFilters?.()
        })

        expect(dispatchMock).toHaveBeenCalledWith(setViewEditModeAction)
        await waitFor(() => {
            expect(
                screen.getByText('isSettingsExpanded: true'),
            ).toBeInTheDocument()
        })
    })

    it('should register the active view when MS4.5 flag is enabled and clean', async () => {
        const view = { id: 123456, type: 'ticket-list', name: 'Open' }
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        useGetViewMock.mockReturnValue(mockUseGetViewResult(undefined))
        mockSelectors({ view, currentActiveView: activeView })

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        await waitFor(() => {
            expect(setViewActiveMock).toHaveBeenCalledWith(fromJS(view))
        })
        expect(dispatchMock).toHaveBeenCalledWith(setViewActiveAction)
    })

    it('should not overwrite an already active saved view with stale persisted data', () => {
        const staleView = { id: 123456, type: 'ticket-list', name: 'Open' }
        const savedActiveView = fromJS({
            id: 123456,
            type: 'ticket-list',
            name: 'Open tickets',
            search: 'test search',
            filters: 'status:closed',
        })

        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        mockSelectors({
            view: staleView,
            currentActiveView: savedActiveView,
        })

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        expect(setViewActiveMock).not.toHaveBeenCalled()
        expect(dispatchMock).not.toHaveBeenCalledWith(setViewActiveAction)
    })

    it('should hydrate a different view in read mode even if the previous one was editing', async () => {
        mockViewId = 999999
        const nextPersistedView = {
            id: 999999,
            type: 'ticket-list',
            name: 'Another view',
            search: '',
            filters: 'status:closed',
        }
        const editingActiveView = fromJS({
            id: 123456,
            search: 'test search',
            filters: 'status:open',
        })

        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        useGetViewMock.mockReturnValue(
            mockUseGetViewResult({ data: nextPersistedView }),
        )
        useLocationMock.mockReturnValue({
            pathname: '/app/views/999999',
            state: undefined,
        } as ReturnType<typeof useLocation>)
        mockSelectors({
            currentActiveView: editingActiveView,
            isEditMode: true,
        })

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        await waitFor(() => {
            expect(setViewActiveMock).toHaveBeenCalledWith(
                fromJS(nextPersistedView),
            )
        })
        expect(setViewEditModeMock).not.toHaveBeenCalledWith(
            fromJS(nextPersistedView),
        )
    })

    it('should initialize a new public draft view route in edit mode', async () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        useLocationMock.mockReturnValue({
            pathname: '/app/tickets/new/public',
            state: undefined,
        } as ReturnType<typeof useLocation>)
        mockSelectors({
            currentActiveView: fromJS({ id: 999, type: 'ticket-list' }),
            isEditMode: false,
        })
        getIsEditMode.mockImplementation(() =>
            dispatchMock.mock.calls.some(
                ([action]) => action === setViewEditModeAction,
            ),
        )

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        await waitFor(() => {
            expect(setViewEditModeMock).toHaveBeenCalled()
        })

        const draftView = getLastSetViewEditModeDraftView()
        expect(draftView.get('id')).toBe(BASE_VIEW_ID)
        expect(draftView.get('visibility')).toBe(ViewVisibility.Public)
        expect(draftView.get('name')).toBe('')
        expect(useGetViewMock).toHaveBeenCalledWith(mockViewId, {
            query: { enabled: false },
        })
        expect(screen.getByText(`viewId: ${BASE_VIEW_ID}`)).toBeInTheDocument()
        expect(screen.getByText('titleOverride: New view')).toBeInTheDocument()
        expect(screen.getByText('hideCreateTicket: true')).toBeInTheDocument()
        expect(screen.getByText('isDraftView: true')).toBeInTheDocument()
        expect(
            screen.getByText(
                'dirtyView: {"enabled":true,"search":"","filters":"","areFiltersValid":true}',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('isSettingsExpanded: true')).toBeInTheDocument()
        expect(setViewActiveMock).not.toHaveBeenCalled()
    })

    it('should initialize a new private draft view route in edit mode', async () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        useLocationMock.mockReturnValue({
            pathname: '/app/tickets/new/private',
            state: undefined,
        } as ReturnType<typeof useLocation>)
        mockSelectors({
            currentActiveView: fromJS({ id: 999, type: 'ticket-list' }),
            isEditMode: false,
        })
        getIsEditMode.mockImplementation(() =>
            dispatchMock.mock.calls.some(
                ([action]) => action === setViewEditModeAction,
            ),
        )

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        await waitFor(() => {
            expect(setViewEditModeMock).toHaveBeenCalled()
        })

        const draftView = getLastSetViewEditModeDraftView()
        expect(draftView.get('visibility')).toBe(ViewVisibility.Private)
        expect(draftView.get('name')).toBe('')
        expect(setViewActiveMock).not.toHaveBeenCalled()
    })

    it('should keep draft fields local when they change on a new view route', async () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        useLocationMock.mockReturnValue({
            pathname: '/app/tickets/new/public',
            state: undefined,
        } as ReturnType<typeof useLocation>)
        mockSelectors({
            currentActiveView: fromJS({
                id: BASE_VIEW_ID,
                type: 'ticket-list',
                fields: [ViewField.Details, ViewField.Customer],
            }),
            isEditMode: true,
        })

        const user = userEvent.setup()

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        expect(
            screen.getByText(
                `draftFields: ${JSON.stringify([
                    ViewField.Details,
                    ViewField.Customer,
                ])}`,
            ),
        ).toBeInTheDocument()

        await act(async () => {
            await user.click(
                screen.getByRole('button', { name: 'Change draft fields' }),
            )
        })

        expect(
            screen.getByText(
                `draftFields: ${JSON.stringify([ViewField.Subject])}`,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                `ViewPanelFiltersBridge draftFields: ${JSON.stringify([
                    ViewField.Subject,
                ])}`,
            ),
        ).toBeInTheDocument()
    })

    it('should reset local draft fields when resetting a new view route', async () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        useLocationMock.mockReturnValue({
            pathname: '/app/tickets/new/public',
            state: undefined,
        } as ReturnType<typeof useLocation>)
        mockSelectors({
            currentActiveView: fromJS({
                id: BASE_VIEW_ID,
                type: 'ticket-list',
                fields: [ViewField.Details, ViewField.Customer],
            }),
            isEditMode: true,
        })

        const user = userEvent.setup()

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        await user.click(
            screen.getByRole('button', { name: 'Change draft fields' }),
        )

        expect(
            screen.getByText(
                `draftFields: ${JSON.stringify([ViewField.Subject])}`,
            ),
        ).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Edit view' }))

        expect(dispatchMock).toHaveBeenCalledWith(resetViewAction)
        expect(
            screen.getByText(
                `draftFields: ${JSON.stringify([
                    ViewField.Details,
                    ViewField.Channel,
                    ViewField.Assignee,
                    ViewField.Status,
                    ViewField.Customer,
                    ViewField.Created,
                    ViewField.LastMessage,
                ])}`,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                `ViewPanelFiltersBridge draftFields: ${JSON.stringify([
                    ViewField.Details,
                    ViewField.Channel,
                    ViewField.Assignee,
                    ViewField.Status,
                    ViewField.Customer,
                    ViewField.Created,
                    ViewField.LastMessage,
                ])}`,
            ),
        ).toBeInTheDocument()
    })

    it('should use the route default draft fields when re-entering a new view route', async () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)

        let currentPathname = '/app/tickets/new/public'
        useLocationMock.mockImplementation(
            () =>
                ({
                    pathname: currentPathname,
                    state: undefined,
                }) as ReturnType<typeof useLocation>,
        )

        let currentActiveView = fromJS({
            id: BASE_VIEW_ID,
            type: 'ticket-list',
            fields: [ViewField.Subject],
        })
        getActiveView.mockImplementation(() => currentActiveView)
        getIsEditMode.mockReturnValue(true)
        useAppSelectorMock.mockImplementation((selector) =>
            selector({} as StoreState),
        )

        const { rerender } = render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        expect(
            screen.getByText(
                `draftFields: ${JSON.stringify([ViewField.Subject])}`,
            ),
        ).toBeInTheDocument()

        currentPathname = '/app/views/123'
        rerender(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        currentActiveView = fromJS({
            id: BASE_VIEW_ID,
            type: 'ticket-list',
            fields: [],
        })
        currentPathname = '/app/tickets/new/public'

        rerender(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        expect(
            screen.getByText(
                `draftFields: ${JSON.stringify([
                    ViewField.Details,
                    ViewField.Channel,
                    ViewField.Assignee,
                    ViewField.Status,
                    ViewField.Customer,
                    ViewField.Created,
                    ViewField.LastMessage,
                ])}`,
            ),
        ).toBeInTheDocument()
    })

    it('should reinitialize the draft when the new view route visibility changes', async () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)

        let currentPathname = '/app/tickets/new/public'
        useLocationMock.mockImplementation(
            () =>
                ({
                    pathname: currentPathname,
                    state: undefined,
                }) as ReturnType<typeof useLocation>,
        )

        let currentActiveView = fromJS({
            id: 999,
            type: 'ticket-list',
        })
        getActiveView.mockImplementation(() => currentActiveView)
        getIsEditMode.mockImplementation(() =>
            dispatchMock.mock.calls.some(
                ([action]) => action === setViewEditModeAction,
            ),
        )
        useAppSelectorMock.mockImplementation((selector) =>
            selector({} as StoreState),
        )

        const { rerender } = render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        await waitFor(() => {
            expect(setViewEditModeMock).toHaveBeenCalledTimes(1)
        })
        expect(getLastSetViewEditModeDraftView().get('visibility')).toBe(
            ViewVisibility.Public,
        )

        currentActiveView = fromJS({
            id: BASE_VIEW_ID,
            type: 'ticket-list',
            visibility: ViewVisibility.Public,
        })
        currentPathname = '/app/tickets/new/private'

        rerender(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        await waitFor(() => {
            expect(setViewEditModeMock).toHaveBeenCalledTimes(2)
        })
        expect(getLastSetViewEditModeDraftView().get('visibility')).toBe(
            ViewVisibility.Private,
        )
    })

    it('re-seeds the draft when re-entering a new view route with different route state', async () => {
        // Regression: clicking a stat view-link, going back, then clicking a
        // second link used to keep the first link's filters because the draft
        // was already open in edit mode and the effect bailed out before
        // noticing the route state had changed.
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)

        let currentState: { viewName?: string; filters?: string } | undefined =
            {
                viewName: 'Open tickets assigned to: Agent 1',
                filters: 'eq(ticket.assignee_user.id, 1)',
            }
        useLocationMock.mockImplementation(
            () =>
                ({
                    pathname: '/app/tickets/new/public',
                    state: currentState,
                }) as ReturnType<typeof useLocation>,
        )

        let currentActiveView = fromJS({ id: 999, type: 'ticket-list' })
        getActiveView.mockImplementation(() => currentActiveView)
        getIsEditMode.mockImplementation(() =>
            dispatchMock.mock.calls.some(
                ([action]) => action === setViewEditModeAction,
            ),
        )
        useAppSelectorMock.mockImplementation((selector) =>
            selector({} as StoreState),
        )

        const { rerender } = render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        await waitFor(() => {
            expect(setViewEditModeMock).toHaveBeenCalledTimes(1)
        })

        // The first link left the BASE_VIEW draft open in edit mode — the state
        // that previously suppressed re-initialization for the next link.
        currentActiveView = fromJS({
            id: BASE_VIEW_ID,
            type: 'ticket-list',
            visibility: ViewVisibility.Public,
        })
        currentState = {
            viewName: 'Open tickets assigned to: Agent 2',
            filters: 'eq(ticket.assignee_user.id, 2)',
        }

        rerender(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        // Without the fresh-route-state guard the effect bailed out here and the
        // draft kept Agent 1's filters; it must re-seed instead.
        await waitFor(() => {
            expect(setViewEditModeMock).toHaveBeenCalledTimes(2)
        })
        expect(getLastSetViewEditModeDraftView().get('id')).toBe(BASE_VIEW_ID)
    })

    it('should keep the new view table preview on the stable baseline when a draft filter is incomplete', () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        useLocationMock.mockReturnValue({
            pathname: '/app/tickets/new/public',
            state: undefined,
        } as ReturnType<typeof useLocation>)
        mockSelectors({
            currentActiveView: fromJS({
                id: BASE_VIEW_ID,
                type: 'ticket-list',
                search: '',
                filters: "eq(ticket.channel, '')",
                filters_ast: buildCallExpressionAst('eq', ''),
            }),
            isDirty: true,
            isEditMode: true,
            areFiltersValid: true,
            areFiltersValidAst: false,
        })

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        expect(
            screen.getByText(
                'dirtyView: {"enabled":true,"search":"","filters":"","areFiltersValid":true}',
            ),
        ).toBeInTheDocument()
    })

    it('should preview completed draft filters on a new view after an incomplete draft', async () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        useLocationMock.mockReturnValue({
            pathname: '/app/tickets/new/public',
            state: undefined,
        } as ReturnType<typeof useLocation>)

        let currentActiveView = fromJS({
            id: BASE_VIEW_ID,
            type: 'ticket-list',
            search: '',
            filters: "eq(ticket.channel, '')",
            filters_ast: buildCallExpressionAst('eq', ''),
        })

        getViewPlainJS.mockReturnValue(null)
        getActiveView.mockImplementation(() => currentActiveView)
        getIsDirty.mockReturnValue(true)
        getIsEditMode.mockReturnValue(true)
        getAreFiltersValid.mockReturnValue(true)
        getAreFiltersValidAst.mockReturnValue(false)
        useAppSelectorMock.mockImplementation((selector) =>
            selector({} as StoreState),
        )

        const { rerender } = render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        expect(
            screen.getByText(
                'dirtyView: {"enabled":true,"search":"","filters":"","areFiltersValid":true}',
            ),
        ).toBeInTheDocument()

        currentActiveView = fromJS({
            id: BASE_VIEW_ID,
            type: 'ticket-list',
            search: '',
            filters: "eq(ticket.channel, 'chat')",
            filters_ast: buildCallExpressionAst('eq', 'chat'),
        })
        getAreFiltersValidAst.mockReturnValue(true)

        rerender(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        expect(
            screen.getByText(
                'dirtyView: {"enabled":true,"search":"","filters":"eq(ticket.channel, \'chat\')","areFiltersValid":true}',
            ),
        ).toBeInTheDocument()
    })

    describe('Apply macro', () => {
        beforeEach(() => {
            useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        })

        it('does not render ApplyMacro initially', () => {
            render(
                <Panels size={1000}>
                    <ViewPanelEntrypoint />
                </Panels>,
            )

            expect(screen.queryByText('ApplyMacro')).not.toBeInTheDocument()
        })

        it('renders ApplyMacro when ViewPanel calls onApplyMacro', async () => {
            const user = userEvent.setup()
            render(
                <Panels size={1000}>
                    <ViewPanelEntrypoint />
                </Panels>,
            )

            await user.click(screen.getByRole('button', { name: 'Open macro' }))

            expect(await screen.findByText('ApplyMacro')).toBeInTheDocument()
            expect(screen.getByText('ticketIds: 1,2,3')).toBeInTheDocument()
        })

        it('hides ApplyMacro when setIsOpen is called with false', async () => {
            const user = userEvent.setup()
            render(
                <Panels size={1000}>
                    <ViewPanelEntrypoint />
                </Panels>,
            )

            await user.click(screen.getByRole('button', { name: 'Open macro' }))
            expect(await screen.findByText('ApplyMacro')).toBeInTheDocument()

            await user.click(
                screen.getByRole('button', { name: 'Close macro' }),
            )

            expect(screen.queryByText('ApplyMacro')).not.toBeInTheDocument()
        })

        it('hides ApplyMacro when the macro is applied', async () => {
            const user = userEvent.setup()
            render(
                <Panels size={1000}>
                    <ViewPanelEntrypoint />
                </Panels>,
            )

            await user.click(screen.getByRole('button', { name: 'Open macro' }))
            expect(await screen.findByText('ApplyMacro')).toBeInTheDocument()

            await user.click(
                screen.getByRole('button', { name: 'Apply macro' }),
            )

            expect(screen.queryByText('ApplyMacro')).not.toBeInTheDocument()
        })
    })
})
