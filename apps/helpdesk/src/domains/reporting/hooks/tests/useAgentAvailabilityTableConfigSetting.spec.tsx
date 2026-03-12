import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useAgentAvailabilityTableConfigSetting } from 'domains/reporting/hooks/useAgentAvailabilityTableConfigSetting'
import { TableRowsOrderWithTotal } from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import { ORDERED_FIXED_AGENT_AVAILABILITY_COLUMNS } from 'domains/reporting/pages/support-performance/agents/constants'
import { AgentsTableRow } from 'domains/reporting/state/ui/stats/types'
import { account } from 'fixtures/account'
import { submitAgentAvailabilityTableConfigView } from 'state/currentAccount/actions'
import type { AccountSettingAgentAvailabilityTableConfig } from 'state/currentAccount/types'
import { AccountSettingType } from 'state/currentAccount/types'
import type { RootState, StoreDispatch } from 'state/types'

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])
jest.mock('state/currentAccount/actions')
const submitAgentAvailabilityTableConfigViewMock = assumeMock(
    submitAgentAvailabilityTableConfigView,
)

describe('useAgentAvailabilityTableConfigSetting', () => {
    it('should return default columns and rows order when no setting available', () => {
        const state = {
            currentAccount: fromJS(account),
        } as RootState

        const { result } = renderHook(
            () => useAgentAvailabilityTableConfigSetting(undefined),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(state)}>{children}</Provider>
                ),
            },
        )

        expect(result.current.columnsOrder).toEqual(
            ORDERED_FIXED_AGENT_AVAILABILITY_COLUMNS,
        )
        expect(result.current.rowsOrder).toEqual(TableRowsOrderWithTotal)
        expect(result.current.currentView.id).toBe('default-view')
        expect(result.current.currentView.name).toBe('Default View')
        expect(result.current.currentView.metrics).toHaveLength(
            ORDERED_FIXED_AGENT_AVAILABILITY_COLUMNS.length,
        )
        expect(result.current.submitActiveView).toEqual(expect.any(Function))
    })

    it('should include custom status columns when customStatuses provided', () => {
        const customStatuses = [
            {
                id: 'lunch_break',
                name: 'Lunch Break',
                description: null,
            },
        ]
        const state = {
            currentAccount: fromJS(account),
        } as RootState

        const { result } = renderHook(
            () => useAgentAvailabilityTableConfigSetting(customStatuses as any),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(state)}>{children}</Provider>
                ),
            },
        )

        expect(result.current.columnsOrder).toContain(
            'agent_status_lunch_break',
        )
        expect(result.current.columnsOrder).toEqual(
            expect.arrayContaining(ORDERED_FIXED_AGENT_AVAILABILITY_COLUMNS),
        )
    })

    it('should return data from setting when available', () => {
        const metrics = ORDERED_FIXED_AGENT_AVAILABILITY_COLUMNS.map(
            (column) => ({
                id: column,
                visibility: true,
            }),
        )
        const view = {
            id: 'custom-view',
            name: 'Custom View',
            metrics,
            rows: [
                { id: AgentsTableRow.Average, visibility: true },
                { id: AgentsTableRow.Total, visibility: true },
            ],
        }
        const tableSetting: AccountSettingAgentAvailabilityTableConfig = {
            id: 123,
            type: AccountSettingType.AgentAvailabilityTableConfig,
            data: {
                active_view: 'custom-view',
                views: [view],
            } as any,
        }

        const state = {
            currentAccount: fromJS({
                ...account,
                settings: [...account.settings, tableSetting],
            }),
        } as RootState

        const { result } = renderHook(
            () => useAgentAvailabilityTableConfigSetting(undefined),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(state)}>{children}</Provider>
                ),
            },
        )

        expect(result.current.columnsOrder).toEqual(
            ORDERED_FIXED_AGENT_AVAILABILITY_COLUMNS,
        )
        expect(result.current.rowsOrder).toEqual(TableRowsOrderWithTotal)
        expect(result.current.currentView.id).toBe('custom-view')
        expect(result.current.currentView.name).toBe('Custom View')
    })

    it('should return columns in order stored in settings and filter unsupported ones', () => {
        const columnsSavedInCustomOrder = [
            'agent_online_time',
            'agent_name',
            'agent_status_available',
        ]
        const unsupportedColumn = 'agent_unsupported_column'
        const restOfTheColumns =
            ORDERED_FIXED_AGENT_AVAILABILITY_COLUMNS.filter(
                (column) => !columnsSavedInCustomOrder.includes(column),
            )
        const metrics = [...columnsSavedInCustomOrder, unsupportedColumn].map(
            (column) => ({
                id: column,
                visibility: true,
            }),
        )
        const viewId = 'test-view'
        const view = {
            id: viewId,
            name: 'Test view',
            metrics,
        }
        const tableSetting: AccountSettingAgentAvailabilityTableConfig = {
            id: 123,
            type: AccountSettingType.AgentAvailabilityTableConfig,
            data: {
                active_view: viewId,
                views: [view],
            } as any,
        }

        const state = {
            currentAccount: fromJS({
                ...account,
                settings: [...account.settings, tableSetting],
            }),
        } as RootState

        const { result } = renderHook(
            () => useAgentAvailabilityTableConfigSetting(undefined),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(state)}>{children}</Provider>
                ),
            },
        )

        expect(result.current.columnsOrder).toEqual([
            ...columnsSavedInCustomOrder,
            ...restOfTheColumns,
        ])
        expect(result.current.columnsOrder).not.toContain(unsupportedColumn)
    })

    it('should call submitAgentAvailabilityTableConfigView when submitActiveView is invoked', async () => {
        submitAgentAvailabilityTableConfigViewMock.mockReturnValue({
            type: 'someType',
        } as any)
        const state = {
            currentAccount: fromJS(account),
        } as RootState
        const store = mockStore(state)

        const { result } = renderHook(
            () => useAgentAvailabilityTableConfigSetting(undefined),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )

        await result.current.submitActiveView(result.current.currentView)

        expect(submitAgentAvailabilityTableConfigViewMock).toHaveBeenCalledWith(
            result.current.currentView,
        )
    })
})
