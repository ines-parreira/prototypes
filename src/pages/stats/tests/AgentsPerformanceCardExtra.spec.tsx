import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'

import {agents} from 'fixtures/agents'
import {UserRole} from 'config/types/user'
import {RootState} from 'state/types'
import {AgentsPerformanceCardExtra} from 'pages/stats/AgentsPerformanceCardExtra'
import {AgentsEditColumns} from 'pages/stats/AgentsEditColumns'
import {AgentPerformanceHeatmapSwitch} from 'pages/stats/AgentPerformanceHeatmapSwitch'
import {assumeMock} from 'utils/testing'

jest.mock('pages/stats/AgentsEditColumns.tsx')
const AgentsEditColumnsMock = assumeMock(AgentsEditColumns)
jest.mock('pages/stats/AgentPerformanceHeatmapSwitch.tsx')
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
