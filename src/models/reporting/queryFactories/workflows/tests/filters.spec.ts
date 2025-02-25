import { WorkflowDatasetFilterMember } from 'models/reporting/cubes/automate_v2/WorkflowDatasetCube'
import { workflowDatasetDefaultFilters } from 'models/reporting/queryFactories/workflows/filters'

describe('workflowDatasetDefaultFilters', () => {
    it('should map WorkflowStatsFilters to ReportingFilter', () => {
        const mockFilters = {
            period: {
                start_datetime: '2021-01-01T00:00:00Z',
                end_datetime: '2021-01-02T00:00:00Z',
            },
            workflowId: '1',
        }

        const expectedOutput = [
            {
                member: WorkflowDatasetFilterMember.PeriodStart,
                operator: 'afterDate',
                values: ['2021-01-01T00:00:00.000'],
            },
            {
                member: WorkflowDatasetFilterMember.PeriodEnd,
                operator: 'beforeDate',
                values: ['2021-01-02T00:00:00.000'],
            },
            {
                member: WorkflowDatasetFilterMember.FlowId,
                operator: 'equals',
                values: ['1'],
            },
        ]

        const result = workflowDatasetDefaultFilters(mockFilters)
        expect(result).toEqual(expectedOutput)
    })
})
