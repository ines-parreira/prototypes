import {
    billableTicketDatasetExcludingAIAgentQueryFactory,
    billableTicketDatasetResolvedByAIAgentQueryFactory,
} from '../metrics'

describe('Automate metrics', () => {
    const timezone = 'UTC'
    const filters = {
        channels: ['chat'],
        period: {
            start_datetime: '2021-01-01T00:00:00Z',
            end_datetime: '2021-01-02T00:00:00Z',
        },
    }

    describe('billableTicketDatasetExcludingAIAgentQueryFactory', () => {
        it('filters out tickets resolved by AI agent', () => {
            const aiAgentUserId = '4000'
            expect(
                billableTicketDatasetExcludingAIAgentQueryFactory(
                    filters,
                    timezone,
                    aiAgentUserId,
                ),
            ).toEqual({
                dimensions: [],
                filters: [
                    {
                        member: 'BillableTicketDataset.periodStart',
                        operator: 'afterDate',
                        values: ['2021-01-01T00:00:00.000'],
                    },
                    {
                        member: 'BillableTicketDataset.periodEnd',
                        operator: 'beforeDate',
                        values: ['2021-01-02T00:00:00.000'],
                    },
                    {
                        member: 'BillableTicketDataset.resolvedByAgentUserId',
                        operator: 'notEquals',
                        values: ['4000'],
                    },
                ],
                measures: [
                    'BillableTicketDataset.billableTicketCount',
                    'BillableTicketDataset.totalFirstResponseTime',
                    'BillableTicketDataset.totalResolutionTime',
                ],
                timezone: 'UTC',
            })
        })

        it('does not filter out tickets resolved by AI agent if there is no AI agent', () => {
            expect(
                billableTicketDatasetExcludingAIAgentQueryFactory(
                    filters,
                    timezone,
                    undefined,
                ),
            ).toEqual({
                dimensions: [],
                filters: [
                    {
                        member: 'BillableTicketDataset.periodStart',
                        operator: 'afterDate',
                        values: ['2021-01-01T00:00:00.000'],
                    },
                    {
                        member: 'BillableTicketDataset.periodEnd',
                        operator: 'beforeDate',
                        values: ['2021-01-02T00:00:00.000'],
                    },
                ],
                measures: [
                    'BillableTicketDataset.billableTicketCount',
                    'BillableTicketDataset.totalFirstResponseTime',
                    'BillableTicketDataset.totalResolutionTime',
                ],
                timezone: 'UTC',
            })
        })
    })

    describe('billableTicketDatasetResolvedByAIAgentQueryFactory', () => {
        it('filters by resolved by agent user id', () => {
            const aiAgentUserId = '4000'
            expect(
                billableTicketDatasetResolvedByAIAgentQueryFactory(
                    filters,
                    timezone,
                    aiAgentUserId,
                ),
            ).toEqual({
                dimensions: [],
                filters: [
                    {
                        member: 'BillableTicketDataset.periodStart',
                        operator: 'afterDate',
                        values: ['2021-01-01T00:00:00.000'],
                    },
                    {
                        member: 'BillableTicketDataset.periodEnd',
                        operator: 'beforeDate',
                        values: ['2021-01-02T00:00:00.000'],
                    },
                    {
                        member: 'BillableTicketDataset.resolvedByAgentUserId',
                        operator: 'equals',
                        values: ['4000'],
                    },
                ],
                measures: [
                    'BillableTicketDataset.billableTicketCount',
                    'BillableTicketDataset.totalFirstResponseTime',
                    'BillableTicketDataset.totalResolutionTime',
                ],
                timezone: 'UTC',
            })
        })

        it('filters with resolvedByAgentUserId = -1 if there is no AI agent', () => {
            expect(
                billableTicketDatasetResolvedByAIAgentQueryFactory(
                    filters,
                    timezone,
                    undefined,
                ),
            ).toEqual({
                dimensions: [],
                filters: [
                    {
                        member: 'BillableTicketDataset.periodStart',
                        operator: 'afterDate',
                        values: ['2021-01-01T00:00:00.000'],
                    },
                    {
                        member: 'BillableTicketDataset.periodEnd',
                        operator: 'beforeDate',
                        values: ['2021-01-02T00:00:00.000'],
                    },
                    {
                        member: 'BillableTicketDataset.resolvedByAgentUserId',
                        operator: 'equals',
                        values: ['-1'],
                    },
                ],
                measures: [
                    'BillableTicketDataset.billableTicketCount',
                    'BillableTicketDataset.totalFirstResponseTime',
                    'BillableTicketDataset.totalResolutionTime',
                ],
                timezone: 'UTC',
            })
        })
    })
})
