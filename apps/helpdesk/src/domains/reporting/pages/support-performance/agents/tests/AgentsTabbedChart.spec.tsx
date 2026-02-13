import React from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'

import { AgentsPerformanceCardExtra } from 'domains/reporting/pages/support-performance/agents/AgentsPerformanceCardExtra'
import { AgentsTabbedChart } from 'domains/reporting/pages/support-performance/agents/AgentsTabbedChart'
import { AgentsTableWithDefaultState } from 'domains/reporting/pages/support-performance/agents/AgentsTable'
import { SECTION_TITLES } from 'domains/reporting/pages/support-performance/agents/constants'

jest.mock('@repo/feature-flags')
const useFlagMock = assumeMock(useFlag)

jest.mock(
    'domains/reporting/pages/support-performance/agents/AgentsPerformanceCardExtra.tsx',
)
const AgentsPerformanceCardExtraMock = assumeMock(AgentsPerformanceCardExtra)

jest.mock('domains/reporting/pages/support-performance/agents/AgentsTable.tsx')
const AgentsTableWithDefaultStateMock = assumeMock(AgentsTableWithDefaultState)

jest.mock(
    'domains/reporting/pages/support-performance/agents/AgentAvailabilityTable',
)
const AgentAvailabilityTableMock = assumeMock(
    require('domains/reporting/pages/support-performance/agents/AgentAvailabilityTable')
        .AgentAvailabilityTable,
)

jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)

const componentMock = () => <div />

describe('AgentsTabbedChart', () => {
    beforeAll(() => {
        // Mock getAnimations for Axiom Tabs component
        Element.prototype.getAnimations = jest.fn(() => [])
    })

    beforeEach(() => {
        AgentsPerformanceCardExtraMock.mockImplementation(componentMock)
        AgentsTableWithDefaultStateMock.mockImplementation(componentMock)
        AgentAvailabilityTableMock.mockImplementation(componentMock)
        useFlagMock.mockReturnValue(false)
    })

    describe('when feature flag is disabled', () => {
        it('should render only performance table without tabs', () => {
            useFlagMock.mockReturnValue(false)
            const history = createMemoryHistory({
                initialEntries: [
                    '/stats/support-performance-agents/performance',
                ],
            })

            render(
                <Router history={history}>
                    <AgentsTabbedChart chartId="test-chart" />
                </Router>,
            )

            expect(
                screen.getByText(SECTION_TITLES.AGENT_PERFORMANCE),
            ).toBeInTheDocument()
            expect(AgentsTableWithDefaultStateMock).toHaveBeenCalled()
            expect(AgentAvailabilityTableMock).not.toHaveBeenCalled()
            expect(
                screen.queryByRole('tab', { name: 'Agent Performance' }),
            ).not.toBeInTheDocument()
        })
    })

    describe('when feature flag is enabled', () => {
        beforeEach(() => {
            useFlagMock.mockImplementation((flag: FeatureFlagKey) => {
                if (flag === FeatureFlagKey.CustomAgentUnavailableStatuses) {
                    return true
                }
                return false
            })
        })

        it('should render tabs when feature flag is enabled', () => {
            const history = createMemoryHistory({
                initialEntries: [
                    '/stats/support-performance-agents/performance',
                ],
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

        it('should show performance tab and table when on /performance route', () => {
            const history = createMemoryHistory({
                initialEntries: [
                    '/stats/support-performance-agents/performance',
                ],
            })

            render(
                <Router history={history}>
                    <AgentsTabbedChart chartId="test-chart" />
                </Router>,
            )

            const performanceElements = screen.getAllByText(
                SECTION_TITLES.AGENT_PERFORMANCE,
            )
            expect(performanceElements.length).toBeGreaterThan(0)
            expect(AgentsTableWithDefaultStateMock).toHaveBeenCalled()
            expect(AgentAvailabilityTableMock).not.toHaveBeenCalled()
        })

        it('should show availability tab and table when on /availability route', () => {
            const history = createMemoryHistory({
                initialEntries: [
                    '/stats/support-performance-agents/availability',
                ],
            })

            render(
                <Router history={history}>
                    <AgentsTabbedChart chartId="test-chart" />
                </Router>,
            )

            const availabilityElements =
                screen.getAllByText('Agent Availability')
            expect(availabilityElements.length).toBeGreaterThan(0)
            expect(AgentAvailabilityTableMock).toHaveBeenCalled()
            expect(AgentsTableWithDefaultStateMock).not.toHaveBeenCalled()
        })

        it('should select performance tab when on /performance route', () => {
            const history = createMemoryHistory({
                initialEntries: [
                    '/stats/support-performance-agents/performance',
                ],
            })

            render(
                <Router history={history}>
                    <AgentsTabbedChart chartId="test-chart" />
                </Router>,
            )

            const performanceTab = screen.getByRole('tab', {
                name: 'Agent Performance',
            })
            expect(performanceTab).toHaveAttribute('aria-selected', 'true')
        })

        it('should select availability tab when on /availability route', () => {
            const history = createMemoryHistory({
                initialEntries: [
                    '/stats/support-performance-agents/availability',
                ],
            })

            render(
                <Router history={history}>
                    <AgentsTabbedChart chartId="test-chart" />
                </Router>,
            )

            const availabilityTab = screen.getByRole('tab', {
                name: 'Agent Availability',
            })
            expect(availabilityTab).toHaveAttribute('aria-selected', 'true')
        })

        it('should render AgentsPerformanceCardExtra in titleExtra', () => {
            const history = createMemoryHistory({
                initialEntries: [
                    '/stats/support-performance-agents/performance',
                ],
            })

            render(
                <Router history={history}>
                    <AgentsTabbedChart chartId="test-chart" />
                </Router>,
            )

            expect(AgentsPerformanceCardExtraMock).toHaveBeenCalled()
        })

        it('should navigate to availability route when clicking availability tab', async () => {
            const user = userEvent.setup()
            const history = createMemoryHistory({
                initialEntries: [
                    '/stats/support-performance-agents/performance',
                ],
            })

            render(
                <Router history={history}>
                    <AgentsTabbedChart chartId="test-chart" />
                </Router>,
            )

            const availabilityTab = screen.getByRole('tab', {
                name: 'Agent Availability',
            })
            await user.click(availabilityTab)

            expect(history.location.pathname).toBe(
                '/stats/support-performance-agents/availability',
            )
        })

        it('should navigate to performance route when clicking performance tab', async () => {
            const user = userEvent.setup()
            const history = createMemoryHistory({
                initialEntries: [
                    '/stats/support-performance-agents/availability',
                ],
            })

            render(
                <Router history={history}>
                    <AgentsTabbedChart chartId="test-chart" />
                </Router>,
            )

            const performanceTab = screen.getByRole('tab', {
                name: 'Agent Performance',
            })
            await user.click(performanceTab)

            expect(history.location.pathname).toBe(
                '/stats/support-performance-agents/performance',
            )
        })
    })
})
