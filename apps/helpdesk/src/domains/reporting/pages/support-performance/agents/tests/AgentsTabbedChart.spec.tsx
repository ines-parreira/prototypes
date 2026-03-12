import React from 'react'

import { useCustomAgentUnavailableStatusesFlag } from '@repo/agent-status'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'

import { AgentAvailabilityCardExtra } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityCardExtra'
import { AgentsPerformanceCardExtra } from 'domains/reporting/pages/support-performance/agents/AgentsPerformanceCardExtra'
import { AgentsTabbedChart } from 'domains/reporting/pages/support-performance/agents/AgentsTabbedChart'
import { AgentsTableWithDefaultState } from 'domains/reporting/pages/support-performance/agents/AgentsTable'
import { SECTION_TITLES } from 'domains/reporting/pages/support-performance/agents/constants'

jest.mock('@repo/agent-status', () => ({
    ...jest.requireActual('@repo/agent-status'),
    useCustomAgentUnavailableStatusesFlag: jest.fn(),
}))
const useCustomAgentUnavailableStatusesFlagMock = assumeMock(
    useCustomAgentUnavailableStatusesFlag,
)

jest.mock(
    'domains/reporting/pages/support-performance/agents/AgentsPerformanceCardExtra.tsx',
)
const AgentsPerformanceCardExtraMock = assumeMock(AgentsPerformanceCardExtra)

jest.mock(
    'domains/reporting/pages/support-performance/agents/AgentAvailabilityCardExtra.tsx',
)
const AgentAvailabilityCardExtraMock = assumeMock(AgentAvailabilityCardExtra)

jest.mock('domains/reporting/pages/support-performance/agents/AgentsTable.tsx')
const AgentsTableWithDefaultStateMock = assumeMock(AgentsTableWithDefaultState)

jest.mock(
    'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableWithDefaultState',
)
const AgentAvailabilityTableWithDefaultStateMock = assumeMock(
    require('domains/reporting/pages/support-performance/agents/AgentAvailabilityTableWithDefaultState')
        .AgentAvailabilityTableWithDefaultState,
)

jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)

const PERFORMANCE_ROUTE = '/stats/support-performance-agents/performance'
const AVAILABILITY_ROUTE = '/stats/support-performance-agents/availability'

describe('AgentsTabbedChart', () => {
    beforeAll(() => {
        Element.prototype.getAnimations = jest.fn(() => [])
    })

    beforeEach(() => {
        AgentsPerformanceCardExtraMock.mockImplementation(() => (
            <div>Performance Extra Content</div>
        ))
        AgentAvailabilityCardExtraMock.mockImplementation(() => (
            <div>Availability Extra Content</div>
        ))
        AgentsTableWithDefaultStateMock.mockImplementation(() => (
            <div>Performance Table Content</div>
        ))
        AgentAvailabilityTableWithDefaultStateMock.mockImplementation(() => (
            <div>Availability Table Content</div>
        ))
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)
    })

    describe('when feature flag is disabled', () => {
        it('should render only performance table without tabs', () => {
            useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)
            const history = createMemoryHistory({
                initialEntries: [PERFORMANCE_ROUTE],
            })

            render(
                <Router history={history}>
                    <AgentsTabbedChart chartId="test-chart" />
                </Router>,
            )

            expect(
                screen.getByText(SECTION_TITLES.AGENT_PERFORMANCE),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('tab', { name: 'Agent Performance' }),
            ).not.toBeInTheDocument()
        })
    })

    describe('when feature flag is enabled', () => {
        beforeEach(() => {
            useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(true)
        })

        it('should render both tabs', () => {
            const history = createMemoryHistory({
                initialEntries: [PERFORMANCE_ROUTE],
            })

            render(
                <Router history={history}>
                    <AgentsTabbedChart chartId="test-chart" />
                </Router>,
            )

            expect(
                screen.getByRole('tab', { name: 'Agent Performance' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('tab', { name: 'Agent Availability' }),
            ).toBeInTheDocument()
        })

        it.each([
            ['performance', PERFORMANCE_ROUTE, 'Agent Performance'],
            ['availability', AVAILABILITY_ROUTE, 'Agent Availability'],
        ])(
            'should select %s tab when on its route',
            (_, route, expectedTabName) => {
                const history = createMemoryHistory({
                    initialEntries: [route],
                })

                render(
                    <Router history={history}>
                        <AgentsTabbedChart chartId="test-chart" />
                    </Router>,
                )

                expect(
                    screen.getByRole('tab', { name: expectedTabName }),
                ).toHaveAttribute('aria-selected', 'true')
            },
        )

        it.each([
            [
                'availability',
                PERFORMANCE_ROUTE,
                'Agent Availability',
                AVAILABILITY_ROUTE,
            ],
            [
                'performance',
                AVAILABILITY_ROUTE,
                'Agent Performance',
                PERFORMANCE_ROUTE,
            ],
        ])(
            'should navigate to %s route when clicking its tab',
            async (_, startRoute, tabName, expectedRoute) => {
                const user = userEvent.setup()
                const history = createMemoryHistory({
                    initialEntries: [startRoute],
                })

                render(
                    <Router history={history}>
                        <AgentsTabbedChart chartId="test-chart" />
                    </Router>,
                )

                await user.click(screen.getByRole('tab', { name: tabName }))

                expect(history.location.pathname).toBe(expectedRoute)
            },
        )

        it.each([
            [
                'performance',
                PERFORMANCE_ROUTE,
                'Performance Table Content',
                'Availability Table Content',
            ],
            [
                'availability',
                AVAILABILITY_ROUTE,
                'Availability Table Content',
                'Performance Table Content',
            ],
        ])(
            'should render %s table content on its route',
            (_, route, expectedContent, unexpectedContent) => {
                const history = createMemoryHistory({
                    initialEntries: [route],
                })

                render(
                    <Router history={history}>
                        <AgentsTabbedChart chartId="test-chart" />
                    </Router>,
                )

                expect(screen.getByText(expectedContent)).toBeInTheDocument()
                expect(
                    screen.queryByText(unexpectedContent),
                ).not.toBeInTheDocument()
            },
        )

        it.each([
            [
                'performance',
                PERFORMANCE_ROUTE,
                'Performance Extra Content',
                'Availability Extra Content',
            ],
            [
                'availability',
                AVAILABILITY_ROUTE,
                'Availability Extra Content',
                'Performance Extra Content',
            ],
        ])(
            'should render %s extra content only on its tab',
            (_, route, expectedContent, unexpectedContent) => {
                const history = createMemoryHistory({
                    initialEntries: [route],
                })

                render(
                    <Router history={history}>
                        <AgentsTabbedChart chartId="test-chart" />
                    </Router>,
                )

                expect(screen.getByText(expectedContent)).toBeInTheDocument()
                expect(
                    screen.queryByText(unexpectedContent),
                ).not.toBeInTheDocument()
            },
        )
    })
})
