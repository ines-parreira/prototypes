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
    'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableWithDefaultState',
)
const AgentAvailabilityTableWithDefaultStateMock = assumeMock(
    require('domains/reporting/pages/support-performance/agents/AgentAvailabilityTableWithDefaultState')
        .AgentAvailabilityTableWithDefaultState,
)

jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)

describe('AgentsTabbedChart', () => {
    beforeAll(() => {
        // Mock getAnimations for Axiom Tabs component
        Element.prototype.getAnimations = jest.fn(() => [])
    })

    beforeEach(() => {
        AgentsPerformanceCardExtraMock.mockImplementation(() => (
            <div>Performance Extra Content</div>
        ))
        AgentsTableWithDefaultStateMock.mockImplementation(() => (
            <div>Performance Table Content</div>
        ))
        AgentAvailabilityTableWithDefaultStateMock.mockImplementation(() => (
            <div>Availability Table Content</div>
        ))
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

        it('should render performance table content when on /performance route', () => {
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
                screen.getByText('Performance Table Content'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Availability Table Content'),
            ).not.toBeInTheDocument()
        })

        it('should render availability table content when on /availability route', () => {
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

            expect(
                screen.getByText('Availability Table Content'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Performance Table Content'),
            ).not.toBeInTheDocument()
        })

        it('should render performance extra content only on performance tab', () => {
            const history = createMemoryHistory({
                initialEntries: [
                    '/stats/support-performance-agents/performance',
                ],
            })

            const { rerender } = render(
                <Router history={history}>
                    <AgentsTabbedChart chartId="test-chart" />
                </Router>,
            )

            expect(
                screen.getByText('Performance Extra Content'),
            ).toBeInTheDocument()

            // Navigate to availability route
            history.push('/stats/support-performance-agents/availability')
            rerender(
                <Router history={history}>
                    <AgentsTabbedChart chartId="test-chart" />
                </Router>,
            )

            expect(
                screen.queryByText('Performance Extra Content'),
            ).not.toBeInTheDocument()
        })
    })
})
