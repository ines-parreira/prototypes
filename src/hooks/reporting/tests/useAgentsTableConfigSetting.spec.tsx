import {renderHook} from '@testing-library/react-hooks/dom'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
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

    it('should return data from Setting', () => {
        const metrics = [
            {id: TableColumn.AgentName, visibility: true},
            {id: TableColumn.RepliedTickets, visibility: true},
        ]
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
            columnsOrder: metrics.map(({id}) => id),
            currentView: view,
            submitActiveView: expect.any(Function),
        })
    })
})
