import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {UserRole} from 'config/types/user'
import {agents} from 'fixtures/agents'
import {AgentPerformanceHeatmapSwitch} from 'pages/stats/support-performance/agents/AgentPerformanceHeatmapSwitch'
import {AgentsEditColumns} from 'pages/stats/support-performance/agents/AgentsEditColumns'
import {AgentsPerformanceCardExtra} from 'pages/stats/support-performance/agents/AgentsPerformanceCardExtra'
import {RootState} from 'state/types'
import {assumeMock} from 'utils/testing'

jest.mock('pages/stats/support-performance/agents/AgentsEditColumns.tsx')
const AgentsEditColumnsMock = assumeMock(AgentsEditColumns)
jest.mock(
    'pages/stats/support-performance/agents/AgentPerformanceHeatmapSwitch.tsx'
)
const AgentPerformanceHeatmapSwitchMock = assumeMock(
    AgentPerformanceHeatmapSwitch
)

const mockStore = configureMockStore([thunk])

const componentMock = () => <div />

describe('<AgentsPerformanceCardExtra />', () => {
    AgentsEditColumnsMock.mockImplementation(componentMock)
    AgentPerformanceHeatmapSwitchMock.mockImplementation(componentMock)

    it('should render the HeatmapSwitch and Edit Columns', () => {
        render(
            <Provider store={mockStore({})}>
                <AgentsPerformanceCardExtra />
            </Provider>
        )

        expect(AgentsEditColumnsMock).not.toHaveBeenCalled()
        expect(AgentPerformanceHeatmapSwitchMock).toHaveBeenCalled()
    })

    it('should render AgentsEditColumns for Admin user role', () => {
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS({
                        ...agents[0],
                        role: {name: UserRole.Admin},
                    }),
                } as unknown as RootState)}
            >
                <AgentsPerformanceCardExtra />
            </Provider>
        )

        expect(AgentsEditColumnsMock).toHaveBeenCalled()
    })
})
