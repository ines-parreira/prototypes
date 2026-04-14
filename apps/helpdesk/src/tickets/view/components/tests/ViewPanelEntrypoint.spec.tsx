import React from 'react'

import { Panels } from '@repo/layout'
import { assumeMock } from '@repo/testing'
import { useHelpdeskV2MS4Dot5Flag } from '@repo/tickets/feature-flags'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { useHistory, useLocation } from 'react-router-dom'

import { useGetView } from '@gorgias/helpdesk-queries'
import type { useGetView as useGetViewType } from '@gorgias/helpdesk-queries'

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
jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(),
}))
const useAppDispatchMock = assumeMock(useAppDispatch)
const useAppSelectorMock = assumeMock(useAppSelector)

jest.mock('state/views/selectors', () => ({
    areFiltersValid: jest.fn(),
    areFiltersValidAst: jest.fn(),
    getActiveView: jest.fn(),
    getViewPlainJS: jest.fn(),
    isDirty: jest.fn(),
    isEditMode: jest.fn(),
}))
const {
    areFiltersValid: getAreFiltersValid,
    areFiltersValidAst: getAreFiltersValidAst,
    getActiveView,
    getViewPlainJS,
    isDirty: getIsDirty,
    isEditMode: getIsEditMode,
} = jest.requireMock('state/views/selectors') as {
    areFiltersValid: jest.Mock
    areFiltersValidAst: jest.Mock
    getActiveView: jest.Mock
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
    onExpand?: () => void
    onEditView?: () => void
    onFixFilters?: () => void
    onApplyMacro?: (ticketIds: number[]) => void
    topContent?: React.ReactNode
    titleOverride?: string
    hideCreateTicket?: boolean
    isDraftView?: boolean
    dirtyView?: DirtyViewProps
    draftFields?: ViewField[]
    onDraftFieldsChange?: (fields: ViewField[]) => void
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
    } as unknown as ReturnType<typeof useGetViewType>
}

function mockSelectors({
    view = null,
    currentActiveView,
    isDirty = false,
    isEditMode = false,
    areFiltersValid = true,
    areFiltersValidAst = true,
}: {
    view?: unknown
    currentActiveView?: unknown
    isDirty?: boolean
    isEditMode?: boolean
    areFiltersValid?: boolean
    areFiltersValidAst?: boolean
} = {}) {
    getViewPlainJS.mockReturnValue(view)
    getActiveView.mockReturnValue(currentActiveView)
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
        onExpand,
        onApplyMacro,
        topContent,
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
            {topContent}
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
        isExpanded,
        draftFields,
    }: {
        isExpanded: boolean
        draftFields?: ViewField[]
    }) => (
        <div>
            <p>ViewPanelFiltersBridge expanded: {String(isExpanded)}</p>
            <p>
                ViewPanelFiltersBridge draftFields:{' '}
                {JSON.stringify(draftFields ?? [])}
            </p>
        </div>
    ),
)

jest.mock('../ViewPanelFiltersBridge', () => ({
    ViewPanelFiltersBridge: (props: {
        isExpanded: boolean
        draftFields?: ViewField[]
    }) => mockViewPanelFiltersBridge(props),
}))

describe('ViewPanelEntrypoint', () => {
    const dispatchMock = jest.fn()
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
        dispatchMock.mockReset()
        mockViewPanel.mockClear()
        mockViewPanelFiltersBridge.mockClear()
        useAppDispatchMock.mockReturnValue(dispatchMock)
        useHistoryMock.mockReturnValue({
            replace: replaceMock,
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
        expect(mockViewPanelFiltersBridge).not.toHaveBeenCalled()
        expect(
            screen.queryByText(/ViewPanelFiltersBridge expanded:/),
        ).not.toBeInTheDocument()
        expect(screen.queryByText('LegacyViewPanel')).not.toBeInTheDocument()
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
                screen.getByText('ViewPanelFiltersBridge expanded: true'),
            ).toBeInTheDocument()
        })
        expect(replaceMock).toHaveBeenCalledWith('/app/views/123456', {
            openViewFilters: false,
        })
    })

    it('should close filters when onEditView is triggered a second time', async () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        mockSelectors({ currentActiveView: activeView, isEditMode: true })

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        const props = mockViewPanel.mock.calls.at(-1)?.[0]
        act(() => {
            props?.onEditView?.()
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
                screen.getByText('ViewPanelFiltersBridge expanded: true'),
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
                screen.getByText('ViewPanelFiltersBridge expanded: true'),
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
        expect(
            screen.getByText('ViewPanelFiltersBridge expanded: true'),
        ).toBeInTheDocument()
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
