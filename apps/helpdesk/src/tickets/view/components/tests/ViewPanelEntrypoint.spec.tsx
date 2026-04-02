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

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { StoreState } from 'state/types'
import { resetView, setViewActive, setViewEditMode } from 'state/views/actions'

import { ViewPanelEntrypoint } from '../ViewPanelEntrypoint'

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
    getActiveView: jest.fn(),
    getViewPlainJS: jest.fn(),
    isDirty: jest.fn(),
    isEditMode: jest.fn(),
}))
const {
    areFiltersValid: getAreFiltersValid,
    getActiveView,
    getViewPlainJS,
    isDirty: getIsDirty,
    isEditMode: getIsEditMode,
} = jest.requireMock('state/views/selectors') as {
    areFiltersValid: jest.Mock
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

function mockUseGetViewResult(data?: unknown) {
    return {
        data,
    } as ReturnType<typeof useGetViewType>
}

function mockSelectors({
    view = null,
    currentActiveView,
    isDirty = false,
    isEditMode = false,
    areFiltersValid = true,
}: {
    view?: unknown
    currentActiveView?: unknown
    isDirty?: boolean
    isEditMode?: boolean
    areFiltersValid?: boolean
} = {}) {
    getViewPlainJS.mockReturnValue(view)
    getActiveView.mockReturnValue(currentActiveView)
    getIsDirty.mockReturnValue(isDirty)
    getIsEditMode.mockReturnValue(isEditMode)
    getAreFiltersValid.mockReturnValue(areFiltersValid)
    useAppSelectorMock.mockImplementation((selector) =>
        selector({} as StoreState),
    )
}

const mockViewPanel = jest.fn(
    ({
        viewId,
        onExpand,
        onApplyMacro,
        topContent,
        dirtyView,
    }: {
        viewId: number
        onExpand?: () => void
        onEditView?: () => void
        onFixFilters?: () => void
        onApplyMacro?: (ticketIds: number[]) => void
        topContent?: React.ReactNode
        dirtyView?: {
            enabled: boolean
            search: string
            filters: string
            areFiltersValid: boolean
        }
    }) => (
        <div>
            <p>ViewPanel</p>
            <p>viewId: {viewId}</p>
            <p>dirtyView: {JSON.stringify(dirtyView)}</p>
            <button onClick={onExpand}>Expand</button>
            <button onClick={() => onApplyMacro?.([1, 2, 3])}>
                Open macro
            </button>
            {topContent}
        </div>
    ),
)

jest.mock('@repo/tickets/views', () => ({
    ViewPanel: (props: {
        viewId: number
        onExpand?: () => void
        onEditView?: () => void
        onFixFilters?: () => void
        onApplyMacro?: (ticketIds: number[]) => void
        topContent?: React.ReactNode
        dirtyView?: {
            enabled: boolean
            search: string
            filters: string
            areFiltersValid: boolean
        }
    }) => mockViewPanel(props),
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
    ({ isExpanded }: { isExpanded: boolean }) => (
        <div>ViewPanelFiltersBridge expanded: {String(isExpanded)}</div>
    ),
)

jest.mock('../ViewPanelFiltersBridge', () => ({
    ViewPanelFiltersBridge: (props: { isExpanded: boolean }) =>
        mockViewPanelFiltersBridge(props),
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
