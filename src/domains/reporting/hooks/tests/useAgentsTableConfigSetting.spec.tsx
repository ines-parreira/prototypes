import React from 'react'

import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useAgentsTableConfigSetting } from 'domains/reporting/hooks/useAgentsTableConfigSetting'
import {
    agentPerformanceRows,
    agentPerformanceTableActiveView,
    TableColumnsOrder,
    TableRowsOrder,
} from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import {
    AgentsTableColumn,
    AgentsTableRow,
} from 'domains/reporting/state/ui/stats/types'
import { account } from 'fixtures/account'
import { submitAgentTableConfigView } from 'state/currentAccount/actions'
import {
    AccountSettingAgentsTableConfig,
    AccountSettingType,
} from 'state/currentAccount/types'
import { RootState, StoreDispatch } from 'state/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])
jest.mock('state/currentAccount/actions')
const submitAgentTableConfigViewMock = assumeMock(submitAgentTableConfigView)

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

describe('useAgentsTableConfigSetting', () => {
    it('should return default order if no Setting available', () => {
        useFlagMock.mockReturnValue(true)
        const state = {
            currentAccount: fromJS(account),
        } as RootState

        const { result } = renderHook(() => useAgentsTableConfigSetting(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual({
            columnsOrder: [...TableColumnsOrder],
            rowsOrder: TableRowsOrder,
            currentView: {
                ...agentPerformanceTableActiveView,
                metrics: [...agentPerformanceTableActiveView.metrics],
                rows: [
                    ...agentPerformanceRows,
                    {
                        id: AgentsTableRow.Total,
                        visibility: false,
                    },
                ],
            },
            submitActiveView: expect.any(Function),
        })
    })

    it('should return default row order when flag is off', () => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.ReportingAgentsTableAverageAndTotal) {
                return false
            }
        })
        const state = {
            currentAccount: fromJS(account),
        } as RootState

        const { result } = renderHook(() => useAgentsTableConfigSetting(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual({
            columnsOrder: TableColumnsOrder,
            rowsOrder: TableRowsOrder,
            currentView: agentPerformanceTableActiveView,
            submitActiveView: expect.any(Function),
        })
    })

    describe('onlineTime', () => {
        const metrics = Object.keys(TableColumnsOrder).map((column) => ({
            id: column,
            visibility: true,
        }))

        const view = {
            id: 'test',
            name: 'Test view',
            metrics: metrics,
        }
        const tableSetting: AccountSettingAgentsTableConfig = {
            id: 123,
            type: AccountSettingType.AgentsTableConfig,
            data: {
                active_view: 'test',
                views: [view],
            } as any,
        }

        const state = {
            currentAccount: fromJS({
                ...account,
                settings: [...account.settings, tableSetting],
            }),
        } as RootState

        it('should return OnlineTime metrics when feature flag is disabled', () => {
            const { result } = renderHook(() => useAgentsTableConfigSetting(), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(state)}>{children}</Provider>
                ),
            })

            expect(result.current.columnsOrder).toContain(
                AgentsTableColumn.OnlineTime,
            )
            expect(result.current.currentView.metrics).toContainEqual({
                id: AgentsTableColumn.OnlineTime,
                visibility: null,
            })
        })
    })

    it('should return data from Setting', () => {
        const columns = Object.values(TableColumnsOrder)
        const metrics = Object.values(TableColumnsOrder).map((column) => ({
            id: column,
            visibility: true,
        }))
        const view = {
            id: 'test',
            name: 'Test view',
            metrics: metrics,
            rows: [
                {
                    id: AgentsTableRow.Average,
                    visibility: true,
                },
            ],
        }
        const tableSetting: AccountSettingAgentsTableConfig = {
            id: 123,
            type: AccountSettingType.AgentsTableConfig,
            data: {
                active_view: 'test',
                views: [view],
            } as any,
        }

        const state = {
            currentAccount: fromJS({
                ...account,
                settings: [...account.settings, tableSetting],
            }),
        } as RootState

        const { result } = renderHook(() => useAgentsTableConfigSetting(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual({
            columnsOrder: columns,
            rowsOrder: TableRowsOrder,
            currentView: view,
            submitActiveView: expect.any(Function),
        })
    })

    it('should return columns in order they are stored in settings and ignore unsupported ones', () => {
        const columnsSavedInCustomOrder = [
            AgentsTableColumn.ClosedTickets,
            AgentsTableColumn.AgentName,
            AgentsTableColumn.CustomerSatisfaction,
        ]
        const unsupportedColumn = 'agent_unsupported_column'
        const restOfTheColumns = TableColumnsOrder.filter(
            (column) => !columnsSavedInCustomOrder.includes(column),
        )
        const metrics = Object.values([
            ...columnsSavedInCustomOrder,
            unsupportedColumn,
        ]).map((column) => ({
            id: column,
            visibility: true,
        }))
        const viewId = 'test'
        const view = {
            id: viewId,
            name: 'Test view',
            metrics: metrics,
        }
        const tableSetting: AccountSettingAgentsTableConfig = {
            id: 123,
            type: AccountSettingType.AgentsTableConfig,
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

        const { result } = renderHook(() => useAgentsTableConfigSetting(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current.columnsOrder).toEqual([
            ...columnsSavedInCustomOrder,
            ...restOfTheColumns,
        ])
        expect(result.current.columnsOrder).not.toContain(unsupportedColumn)
    })

    it('should submitActiveView', async () => {
        submitAgentTableConfigViewMock.mockReturnValue({
            type: 'someType',
        } as any)
        const state = {
            currentAccount: fromJS(account),
        } as RootState
        const store = mockStore(state)

        const { result } = renderHook(() => useAgentsTableConfigSetting(), {
            wrapper: ({ children }) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        await result.current.submitActiveView(agentPerformanceTableActiveView)

        expect(submitAgentTableConfigViewMock).toHaveBeenCalledWith(
            agentPerformanceTableActiveView,
        )
    })
})
