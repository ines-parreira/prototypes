import { useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { UserRole } from 'config/types/user'
import {
    AgentAvailabilityCardExtra,
    CANDU_ID,
} from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityCardExtra'
import { AgentAvailabilityEditColumns } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityEditColumns'
import { useAgentAvailabilityData } from 'domains/reporting/pages/support-performance/agents/hooks/useAgentAvailabilityData'
import { agents } from 'fixtures/agents'
import type { RootState } from 'state/types'

jest.mock(
    'domains/reporting/pages/support-performance/agents/AgentAvailabilityEditColumns.tsx',
)
const AgentAvailabilityEditColumnsMock = assumeMock(
    AgentAvailabilityEditColumns,
)

jest.mock(
    'domains/reporting/pages/support-performance/agents/hooks/useAgentAvailabilityData',
)
const useAgentAvailabilityDataMock = assumeMock(useAgentAvailabilityData)

jest.mock(
    'domains/reporting/hooks/support-performance/useStatsFilters',
    () => ({
        useStatsFilters: () => ({
            cleanStatsFilters: {},
            userTimezone: 'UTC',
        }),
    }),
)

jest.mock('domains/reporting/state/ui/stats/agentAvailabilitySlice', () => ({
    ...jest.requireActual(
        'domains/reporting/state/ui/stats/agentAvailabilitySlice',
    ),
    getFilteredAgents: jest.fn(() => []),
}))

jest.mock('@repo/feature-flags')
const useFlagMock = assumeMock(useFlag)

const mockStore = configureMockStore([thunk])

const componentMock = () => <div />

describe('<AgentAvailabilityCardExtra />', () => {
    beforeEach(() => {
        AgentAvailabilityEditColumnsMock.mockImplementation(componentMock)
        useFlagMock.mockReturnValue(false)
        useAgentAvailabilityDataMock.mockReturnValue({
            agents: [],
            customStatuses: [],
            isLoading: false,
            isError: false,
            isErrorCustomStatuses: false,
        })
    })

    it('should not render AgentAvailabilityEditColumns for non-Admin user', () => {
        render(
            <Provider store={mockStore({})}>
                <AgentAvailabilityCardExtra />
            </Provider>,
        )

        expect(AgentAvailabilityEditColumnsMock).not.toHaveBeenCalled()
    })

    it('should render AgentAvailabilityEditColumns for Admin user', () => {
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS({
                        ...agents[0],
                        role: { name: UserRole.Admin },
                    }),
                } as unknown as RootState)}
            >
                <AgentAvailabilityCardExtra />
            </Provider>,
        )

        expect(AgentAvailabilityEditColumnsMock).toHaveBeenCalled()
    })

    it('should pass canduId when feature flag is enabled', () => {
        useFlagMock.mockReturnValue(true)

        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS({
                        ...agents[0],
                        role: { name: UserRole.Admin },
                    }),
                } as unknown as RootState)}
            >
                <AgentAvailabilityCardExtra />
            </Provider>,
        )

        expect(AgentAvailabilityEditColumnsMock).toHaveBeenCalledWith(
            expect.objectContaining({
                canduId: CANDU_ID,
            }),
            expect.anything(),
        )
    })
})
