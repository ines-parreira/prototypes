import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { FeatureFlagKey } from 'config/featureFlags'
import { UserRole } from 'config/types/user'
import { agents } from 'fixtures/agents'
import { AgentPerformanceHeatmapSwitch } from 'pages/stats/support-performance/agents/AgentPerformanceHeatmapSwitch'
import { AgentsEditColumns } from 'pages/stats/support-performance/agents/AgentsEditColumns'
import {
    AgentsPerformanceCardExtra,
    CANDU_ID,
} from 'pages/stats/support-performance/agents/AgentsPerformanceCardExtra'
import { RootState } from 'state/types'
import { assumeMock } from 'utils/testing'

jest.mock('pages/stats/support-performance/agents/AgentsEditColumns.tsx')
const AgentsEditColumnsMock = assumeMock(AgentsEditColumns)
jest.mock(
    'pages/stats/support-performance/agents/AgentPerformanceHeatmapSwitch.tsx',
)
const AgentPerformanceHeatmapSwitchMock = assumeMock(
    AgentPerformanceHeatmapSwitch,
)

jest.mock('launchdarkly-react-client-sdk')
const useFlagsMock = assumeMock(useFlags)

const mockStore = configureMockStore([thunk])

const componentMock = () => <div />

describe('<AgentsPerformanceCardExtra />', () => {
    beforeEach(() => {
        AgentsEditColumnsMock.mockImplementation(componentMock)
        AgentPerformanceHeatmapSwitchMock.mockImplementation(componentMock)
        useFlagsMock.mockReturnValue({})
    })

    it('should render the HeatmapSwitch and Edit Columns', () => {
        render(
            <Provider store={mockStore({})}>
                <AgentsPerformanceCardExtra />
            </Provider>,
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
                        role: { name: UserRole.Admin },
                    }),
                } as unknown as RootState)}
            >
                <AgentsPerformanceCardExtra />
            </Provider>,
        )

        expect(AgentsEditColumnsMock).toHaveBeenCalled()
    })

    it('should pass canduId when feature flag is enabled', () => {
        useFlagsMock.mockReturnValue({
            [FeatureFlagKey.ReportingFilteringAndCalculationsTagsReport]: true,
        })

        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS({
                        ...agents[0],
                        role: { name: UserRole.Admin },
                    }),
                } as unknown as RootState)}
            >
                <AgentsPerformanceCardExtra />
            </Provider>,
        )

        expect(AgentsEditColumnsMock).toHaveBeenCalledWith(
            expect.objectContaining({
                canduId: CANDU_ID,
            }),
            expect.anything(),
        )
    })
})
