import { Panels } from '@repo/layout'
import { assumeMock } from '@repo/testing'
import { useHelpdeskV2MS4Dot5Flag } from '@repo/tickets/feature-flags'
import { render, screen } from '@testing-library/react'
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
    ({ viewId }: { viewId: number; onExpand?: () => void }) => (
        <div>
            <p>ViewPanel</p>
            <p>viewId: {viewId}</p>
        </div>
    ),
)

jest.mock('@repo/tickets/views', () => ({
    ViewPanel: (props: { viewId: number; onExpand?: () => void }) =>
        mockViewPanel(props),
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
        const props = mockViewPanel.mock.calls[0]?.[0]
        props?.onExpand?.()
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
})
