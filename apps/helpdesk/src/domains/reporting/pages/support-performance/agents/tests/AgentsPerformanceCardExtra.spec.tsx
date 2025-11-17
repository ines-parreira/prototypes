import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { UserRole } from 'config/types/user'
import { useFlag } from 'core/flags'
import { AgentPerformanceHeatmapSwitch } from 'domains/reporting/pages/support-performance/agents/AgentPerformanceHeatmapSwitch'
import { AgentsEditColumns } from 'domains/reporting/pages/support-performance/agents/AgentsEditColumns'
import {
    AgentsPerformanceCardExtra,
    CANDU_ID,
} from 'domains/reporting/pages/support-performance/agents/AgentsPerformanceCardExtra'
import { agents } from 'fixtures/agents'
import type { RootState } from 'state/types'

jest.mock(
    'domains/reporting/pages/support-performance/agents/AgentsEditColumns.tsx',
)
const AgentsEditColumnsMock = assumeMock(AgentsEditColumns)
jest.mock(
    'domains/reporting/pages/support-performance/agents/AgentPerformanceHeatmapSwitch.tsx',
)
const AgentPerformanceHeatmapSwitchMock = assumeMock(
    AgentPerformanceHeatmapSwitch,
)

jest.mock('core/flags')
const useFlagsMock = assumeMock(useFlag)

const mockStore = configureMockStore([thunk])

const componentMock = () => <div />

describe('<AgentsPerformanceCardExtra />', () => {
    beforeEach(() => {
        AgentsEditColumnsMock.mockImplementation(componentMock)
        AgentPerformanceHeatmapSwitchMock.mockImplementation(componentMock)
        useFlagsMock.mockReturnValue(false)
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
        useFlagsMock.mockReturnValue(true)

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
