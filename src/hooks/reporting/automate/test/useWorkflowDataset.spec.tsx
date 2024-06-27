import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment'
import {QueryClientProvider} from '@tanstack/react-query'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {assumeMock} from 'utils/testing'
import {WorkflowStatsFilters} from 'models/stat/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {
    useWorkflowDatasetTrend,
    useWorkflowStepDatasetTrend,
} from 'hooks/reporting/automate/useWorkflowDataset'

const queryClient = mockQueryClient()
const timezone = 'UTC'

jest.mock('hooks/reporting/useMetricPerDimension')

const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)

const filters: WorkflowStatsFilters = {
    period: {
        start_datetime: moment()
            .add(1 * 7, 'day')
            .format('YYYY-MM-DDT00:00:00.000'),
        end_datetime: moment()
            .add(3 * 7, 'day')
            .format('YYYY-MM-DDT23:50:59.999'),
    },
    workflowId: '1',
}

const workflowStepCountEventsMock = [
    {
        'WorkflowDataset.eventType': 'flow_step_ended',
        'WorkflowDataset.flowStepId': '01J0TNPZA42S2YMV18WW2X00JZ',
        'WorkflowDataset.countEvents': '10',
        decile: '9',
    },
    {
        'WorkflowDataset.eventType': 'flow_step_started',
        'WorkflowDataset.flowStepId': '01J0TNPZA42S2YMV18WW2X00JZ',
        'WorkflowDataset.countEvents': '9',
        decile: '8',
    },
    {
        'WorkflowDataset.eventType': 'flow_started',
        'WorkflowDataset.flowStepId': '01J0TNPZA42S2YMV18WW2X00JZ',
        'WorkflowDataset.countEvents': '9',
        decile: '7',
    },
    {
        'WorkflowDataset.eventType': 'flow_prompt_started',
        'WorkflowDataset.flowStepId': '01J0TNP9PYAF1K20MHTPJJ9TDK',
        'WorkflowDataset.countEvents': '7',
        decile: '6',
    },
    {
        'WorkflowDataset.eventType': 'flow_step_started',
        'WorkflowDataset.flowStepId': '01J0TNP9PYAF1K20MHTPJJ9TDK',
        'WorkflowDataset.countEvents': '7',
        decile: '5',
    },
    {
        'WorkflowDataset.eventType': 'flow_step_ended',
        'WorkflowDataset.flowStepId': '01J0TNP9PYPAVEYD4Z19EKH9GW',
        'WorkflowDataset.countEvents': '7',
        decile: '4',
    },
    {
        'WorkflowDataset.eventType': 'flow_step_started',
        'WorkflowDataset.flowStepId': '01J0TNP9PYPAVEYD4Z19EKH9GW',
        'WorkflowDataset.countEvents': '7',
        decile: '3',
    },
    {
        'WorkflowDataset.eventType': 'flow_step_ended',
        'WorkflowDataset.flowStepId': '01J0TNP9PYAF1K20MHTPJJ9TDK',
        'WorkflowDataset.countEvents': '4',
        decile: '2',
    },
    {
        'WorkflowDataset.eventType': 'flow_step_started',
        'WorkflowDataset.flowStepId': '01J0TNPZA4XSKK0DG5TDKR02FK',
        'WorkflowDataset.countEvents': '3',
        decile: '1',
    },
    {
        'WorkflowDataset.eventType': 'flow_prompt_started',
        'WorkflowDataset.flowStepId': '01J0TNPZA4XSKK0DG5TDKR02FK',
        'WorkflowDataset.countEvents': '3',
        decile: '0',
    },
]
const workflowStepDropoffMock = [
    {
        'WorkflowDataset.flowStepId': '01J0TNP9PYAF1K20MHTPJJ9TDK',
        flowStepDropoff: '3',
        decile: '9',
    },
    {
        'WorkflowDataset.flowStepId': '01J0TNPZA42S2YMV18WW2X00JZ',
        flowStepDropoff: '1',
        decile: '7',
    },
    {
        'WorkflowDataset.flowStepId': '01J0TNPZA4XSKK0DG5TDKR02FK',
        flowStepDropoff: '1',
        decile: '4',
    },
    {
        'WorkflowDataset.flowStepId': '01J0TNP9PYPAVEYD4Z19EKH9GW',
        flowStepDropoff: '0',
        decile: '2',
    },
]
const workflowCountEventsMock = [
    {
        'WorkflowDataset.eventType': 'flow_step_started',
        'WorkflowDataset.countEvents': '26',
        decile: '9',
    },
    {
        'WorkflowDataset.eventType': 'flow_step_ended',
        'WorkflowDataset.countEvents': '21',
        decile: '7',
    },
    {
        'WorkflowDataset.eventType': 'flow_prompt_started',
        'WorkflowDataset.countEvents': '10',
        decile: '4',
    },
    {
        'WorkflowDataset.eventType': 'flow_started',
        'WorkflowDataset.countEvents': '9',
        decile: '2',
    },
]

describe('useWorkflowDataset', () => {
    it('useWorkflowDatasetTrend', () => {
        useMetricPerDimensionMock.mockReturnValueOnce({
            data: {
                allData: workflowCountEventsMock,
                decile: null,
                value: null,
            },
            isFetching: true,
            isError: false,
        })
        useMetricPerDimensionMock.mockReturnValueOnce({
            data: null,
            isFetching: true,
            isError: false,
        })

        jest.spyOn(queryClient, 'invalidateQueries')
        const {result} = renderHook(
            () => useWorkflowDatasetTrend(filters, timezone),
            {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            }
        )

        expect(result.current).toMatchObject({
            workflowAutomatedInteractions: {
                data: {prevValue: null, value: 10},
                isError: false,
                isFetching: true,
            },
            workflowAutomationRate: {
                data: {prevValue: 0, value: 1},
                isError: false,
                isFetching: true,
            },
            workflowDropoff: {
                data: {prevValue: null, value: 0},
                isError: false,
                isFetching: true,
            },
            workflowTicketCreated: {
                data: {prevValue: null, value: 0},
                isError: false,
                isFetching: true,
            },
            workflowTotalViews: {
                data: {prevValue: null, value: 9},
                isError: false,
                isFetching: true,
            },
        })
    })

    it('useWorkflowStepDatasetTrend', () => {
        useMetricPerDimensionMock.mockReturnValueOnce({
            data: {
                allData: workflowStepCountEventsMock,
                decile: null,
                value: null,
            },
            isFetching: true,
            isError: false,
        })
        useMetricPerDimensionMock.mockReturnValueOnce({
            data: {
                allData: workflowStepDropoffMock,
                decile: null,
                value: null,
            },
            isFetching: true,
            isError: false,
        })

        jest.spyOn(queryClient, 'invalidateQueries')
        const {result} = renderHook(
            () => useWorkflowStepDatasetTrend(filters, timezone),
            {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            }
        )

        expect(result.current).toHaveProperty('01J0TNP9PYAF1K20MHTPJJ9TDK')
        expect(result.current).toHaveProperty('01J0TNP9PYPAVEYD4Z19EKH9GW')
        expect(result.current).toHaveProperty('01J0TNPZA4XSKK0DG5TDKR02FK')
        expect(result.current).toHaveProperty('01J0TNPZA42S2YMV18WW2X00JZ')
    })
})
