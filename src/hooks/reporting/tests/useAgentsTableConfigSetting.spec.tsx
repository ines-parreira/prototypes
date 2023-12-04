import {renderHook} from '@testing-library/react-hooks/dom'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {TableColumnsOrder} from 'pages/stats/AgentsTableConfig'
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

        expect(result.current).toEqual(TableColumnsOrder)
    })

    it('should return order from Setting', () => {
        const tableSetting: AccountSettingAgentsTableConfig = {
            id: 123,
            type: AccountSettingType.AgentsTableConfig,
            data: [TableColumn.AgentName, TableColumn.RepliedTickets],
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

        expect(result.current).toEqual(tableSetting.data)
    })
})
