import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import css from 'domains/reporting/pages/common/components/Table/AnalyticsTable.less'
import { AgentsSummaryRow } from 'domains/reporting/pages/support-performance/agents/AgentsSummaryRow'
import {
    getAverageQuery,
    getTotalsQuery,
} from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import {
    AgentsTableColumn,
    AgentsTableRow,
} from 'domains/reporting/state/ui/stats/types'
import { agents } from 'fixtures/agents'

jest.mock(
    'domains/reporting/pages/support-performance/agents/AgentsTableConfig',
)
const getSummaryQueryMock = assumeMock(getAverageQuery)
const getTotalsQueryMock = assumeMock(getTotalsQuery)

describe('<AgentsSummaryRow', () => {
    const statsFilters = {
        cleanStatsFilters: {
            period: {
                start_datetime: '2024-09-14T00:00:00+00:00',
                end_datetime: '2024-09-20T23:59:59+00:00',
            },
        },
        userTimezone: 'UTC',
        isAnalyticsNewFilters: false,
    }

    const agentsList = fromJS({
        all: agents,
    })

    const columns = [
        AgentsTableColumn.AgentName,
        AgentsTableColumn.ClosedTickets,
        AgentsTableColumn.OneTouchTickets,
    ]

    const metricValue = 123

    const tableBody = document.createElement('tbody')

    const metricQuery = (column: AgentsTableColumn) => () => ({
        isFetching: false,
        isError: false,
        data: { value: metricValue, column },
    })

    beforeEach(() => {
        getSummaryQueryMock.mockImplementation(metricQuery)
        getTotalsQueryMock.mockImplementation(metricQuery)
    })

    it('should return average column values', () => {
        render(
            <AgentsSummaryRow
                statsFilters={statsFilters}
                agents={agentsList}
                columns={columns}
                isTableScrolled={false}
                type={AgentsTableRow.Average}
            />,
            {
                container: document.body.appendChild(tableBody),
            },
        )

        expect(screen.getByText('Average')).toBeInTheDocument()
        expect(screen.getByText(`${metricValue}%`)).toBeInTheDocument()
    })

    it('should return total column values', () => {
        render(
            <AgentsSummaryRow
                statsFilters={statsFilters}
                agents={agentsList}
                columns={columns}
                isTableScrolled={false}
                type={AgentsTableRow.Total}
            />,
            {
                container: document.body.appendChild(tableBody),
            },
        )

        expect(screen.getByText('Total')).toBeInTheDocument()
        expect(screen.getByText(`${metricValue}%`)).toBeInTheDocument()
    })

    it('should return have bold text if isEmphasized', () => {
        render(
            <AgentsSummaryRow
                statsFilters={statsFilters}
                agents={agentsList}
                columns={columns}
                isTableScrolled={false}
                type={AgentsTableRow.Total}
                isEmphasized={true}
            />,
            {
                container: document.body.appendChild(tableBody),
            },
        )

        expect(screen.getByText('Total').classList.contains(css.bold)).toBe(
            true,
        )
    })

    it('should render the loading skeleton', () => {
        const loadingMetricQuery = () => () => ({
            isFetching: true,
            isError: false,
            data: { value: metricValue },
        })

        getTotalsQueryMock.mockImplementation(loadingMetricQuery)

        render(
            <AgentsSummaryRow
                statsFilters={statsFilters}
                agents={agentsList}
                columns={columns}
                isTableScrolled={false}
                type={AgentsTableRow.Total}
            />,
            {
                container: document.body.appendChild(tableBody),
            },
        )

        expect(
            document.querySelector('.react-loading-skeleton'),
        ).toBeInTheDocument()
    })

    it('should pass agents filter to exclude unassigned tickets', () => {
        const mockQueryHook = jest.fn(() => ({
            isFetching: false,
            isError: false,
            data: { value: metricValue },
        }))

        getSummaryQueryMock.mockImplementation(() => mockQueryHook)

        render(
            <AgentsSummaryRow
                statsFilters={statsFilters}
                agents={agentsList}
                columns={columns}
                isTableScrolled={false}
                type={AgentsTableRow.Average}
            />,
            {
                container: document.body.appendChild(tableBody),
            },
        )

        expect(mockQueryHook).toHaveBeenCalledWith(
            expect.objectContaining({
                ...statsFilters.cleanStatsFilters,
                agents: {
                    operator: 'not-one-of',
                    values: [],
                },
            }),
            statsFilters.userTimezone,
        )
    })
})
