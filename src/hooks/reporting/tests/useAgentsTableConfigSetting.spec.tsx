import {renderHook} from '@testing-library/react-hooks/dom'
import {fromJS} from 'immutable'
import LD from 'launchdarkly-react-client-sdk'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    TableColumnsOrder,
    SystemTableViews,
    agentPerformanceTableActiveView,
} from 'pages/stats/AgentsTableConfig'
import {useAgentsTableConfigSetting} from 'hooks/reporting/useAgentsTableConfigSetting'
import {account} from 'fixtures/account'
import {
    AccountSettingAgentsTableConfig,
    AccountSettingType,
} from 'state/currentAccount/types'
import {RootState, StoreDispatch} from 'state/types'
import {TableColumn} from 'state/ui/stats/types'

const mockStore = configureMockStore<RootState, StoreDispatch>()

describe('useAgentsTableConfigSetting', () => {
    beforeEach(() => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsTimeBasedMetrics]: false,
        }))
    })

    it('should return default order if no Setting available', () => {
        const state = {
            currentAccount: fromJS(account),
        } as RootState

        const {result} = renderHook(() => useAgentsTableConfigSetting(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual({
            settings: SystemTableViews,
            columnsOrder: TableColumnsOrder,
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

        it('should return new metrics that were not saved in settings', () => {
            const {result} = renderHook(() => useAgentsTableConfigSetting(), {
                wrapper: ({children}) => (
                    <Provider store={mockStore(state)}>{children}</Provider>
                ),
            })

            expect(result.current.columnsOrder).not.toContain(
                TableColumn.OnlineTime
            )
            expect(result.current.currentView.metrics).not.toContainEqual({
                id: TableColumn.OnlineTime,
                visibility: null,
            })
        })

        it('should return OnlineTime metrics when feature flag is disabled', () => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.AnalyticsTimeBasedMetrics]: true,
            }))

            const {result} = renderHook(() => useAgentsTableConfigSetting(), {
                wrapper: ({children}) => (
                    <Provider store={mockStore(state)}>{children}</Provider>
                ),
            })

            expect(result.current.columnsOrder).toContain(
                TableColumn.OnlineTime
            )
            expect(result.current.currentView.metrics).toContainEqual({
                id: TableColumn.OnlineTime,
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

        const {result} = renderHook(() => useAgentsTableConfigSetting(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual({
            settings: tableSetting.data,
            columnsOrder: columns,
            currentView: view,
            submitActiveView: expect.any(Function),
        })
    })

    it('should return columns in order they are stored in settings and ignore unsupported ones', () => {
        const columnsSavedInCustomOrder = [
            TableColumn.ClosedTickets,
            TableColumn.AgentName,
            TableColumn.CustomerSatisfaction,
        ]
        const unsupportedColumn = TableColumn.TicketHandleTime
        const restOfTheColumns = TableColumnsOrder.filter(
            (column) => !columnsSavedInCustomOrder.includes(column)
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

        const {result} = renderHook(() => useAgentsTableConfigSetting(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current.columnsOrder).toEqual([
            ...columnsSavedInCustomOrder,
            ...restOfTheColumns,
        ])
        expect(result.current.columnsOrder).not.toContain(unsupportedColumn)
    })
})
