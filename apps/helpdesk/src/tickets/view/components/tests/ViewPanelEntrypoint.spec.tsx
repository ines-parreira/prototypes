import { Panels } from '@repo/layout'
import { assumeMock } from '@repo/testing'
import { useHelpdeskV2MS4Dot5Flag } from '@repo/tickets/feature-flags'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { setViewActive } from 'state/views/actions'

import { ViewPanelEntrypoint } from '../ViewPanelEntrypoint'

jest.mock('@repo/tickets/feature-flags', () => ({
    useHelpdeskV2MS4Dot5Flag: jest.fn(),
}))
const useHelpdeskV2MS4Dot5FlagMock = assumeMock(useHelpdeskV2MS4Dot5Flag)

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = assumeMock(useAppSelector)

jest.mock('state/views/actions', () => ({ setViewActive: jest.fn() }))
const setViewActiveMock = assumeMock(setViewActive)

const mockViewPanel = jest.fn(
    ({
        viewId,
        onExpand,
        onApplyMacro,
    }: {
        viewId: number
        onExpand?: () => void
        onApplyMacro?: (ticketIds: number[]) => void
    }) => (
        <div>
            <p>ViewPanel</p>
            <p>viewId: {viewId}</p>
            <button onClick={onExpand}>Expand</button>
            <button onClick={() => onApplyMacro?.([1, 2, 3])}>
                Open macro
            </button>
        </div>
    ),
)

jest.mock('@repo/tickets/views', () => ({
    ViewPanel: (props: {
        viewId: number
        onExpand?: () => void
        onApplyMacro?: (ticketIds: number[]) => void
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

jest.mock('tickets/core/hooks', () => ({ useViewId: () => 123456 }))

const setIsEnabledMock = jest.fn()
jest.mock('split-ticket-view-toggle', () => ({
    useSplitTicketView: () => ({ setIsEnabled: setIsEnabledMock }),
}))

describe('ViewPanelEntrypoint', () => {
    const dispatch = jest.fn()
    const view = { id: 123456, type: 'ticket-list', name: 'Open' }
    const setViewActiveAction = jest.fn()

    beforeEach(() => {
        dispatch.mockReset()
        setViewActiveAction.mockReset()
        setIsEnabledMock.mockReset()
        mockViewPanel.mockClear()
        useAppDispatchMock.mockReturnValue(dispatch)
        useAppSelectorMock.mockReturnValue(undefined)
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(false)
        setViewActiveMock.mockReturnValue(setViewActiveAction)
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
        expect(screen.queryByText('LegacyViewPanel')).not.toBeInTheDocument()
    })

    it('should call setIsEnabled(true) when onExpand is triggered', () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )
        screen.getByRole('button', { name: 'Expand' }).click()
        expect(setIsEnabledMock).toHaveBeenCalledWith(true)
    })

    it('should register the active view when MS4.5 flag is enabled', () => {
        useHelpdeskV2MS4Dot5FlagMock.mockReturnValue(true)
        useAppSelectorMock.mockReturnValue(view)

        render(
            <Panels size={1000}>
                <ViewPanelEntrypoint />
            </Panels>,
        )

        expect(setViewActiveMock).toHaveBeenCalledWith(fromJS(view))
        expect(dispatch).toHaveBeenCalledWith(setViewActiveAction)
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
