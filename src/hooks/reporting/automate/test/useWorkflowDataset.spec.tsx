import {QueryClientProvider} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment'
import React from 'react'

import {
    useWorkflowDataset,
    useWorkflowStepDatasetTrend,
} from 'hooks/reporting/automate/useWorkflowDataset'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {WorkflowStatsFilters} from 'models/stat/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

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

const steps = [
    {id: '01J0TNP9PYAF1K20MHTPJJ9TDK', kind: 'message', settings: {}},
    {id: '01J0TNPZA42S2YMV18WW2X00JZ', kind: 'message', settings: {}},
    {id: '01J0TNPZA4XSKK0DG5TDKR02FK', kind: 'end', settings: {}},
    {id: '01J0TNP9PYPAVEYD4Z19EKH9GW', kind: 'handover', settings: {}},
]

describe('useWorkflowDataset', () => {
    it('useWorkflowDatasetTrend', () => {
        useMetricPerDimensionMock.mockReturnValue({
            data: {
                allData: workflowStepCountEventsMock,
                decile: null,
                value: null,
            },
            isFetching: true,
            isError: false,
        })

        jest.spyOn(queryClient, 'invalidateQueries')
        const {result} = renderHook(
            () => useWorkflowDataset(filters, timezone, steps as any),
            {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            }
        )

        expect(result.current).toMatchObject({
            workflowMetrics: {
                workflowAutomatedInteractions: {
                    data: {prevValue: null, value: 3},
                    isError: false,
                    isFetching: true,
                },
                workflowAutomationRate: {
                    data: {prevValue: 1, value: 1},
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
                    data: {prevValue: null, value: 3},
                    isError: false,
                    isFetching: true,
                },
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
            () => useWorkflowStepDatasetTrend(filters, timezone, steps as any),
            {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            }
        )

        expect(result.current.data).toHaveProperty('01J0TNP9PYAF1K20MHTPJJ9TDK')
        expect(result.current.data).toHaveProperty('01J0TNP9PYPAVEYD4Z19EKH9GW')
        expect(result.current.data).toHaveProperty('01J0TNPZA4XSKK0DG5TDKR02FK')
        expect(result.current.data).toHaveProperty('01J0TNPZA42S2YMV18WW2X00JZ')
    })
})
