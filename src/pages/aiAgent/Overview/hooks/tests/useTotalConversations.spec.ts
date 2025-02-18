import {UseQueryResult} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks/dom'

import {AI_MANAGED_TYPES} from 'custom-fields/constants'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {CustomField} from 'custom-fields/types'
import {useMultipleMetricsTrends} from 'hooks/reporting/useMultipleMetricsTrend'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {TicketCustomFieldsMeasure} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {StatsFilters, StatType} from 'models/stat/types'

import {useTotalConversations} from 'pages/aiAgent/Overview/hooks/kpis/useTotalConversations'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMultipleMetricsTrend')
const useMultipleMetricsTrendsMock = assumeMock(useMultipleMetricsTrends)

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)

const filters: StatsFilters = {
    period: {
        start_datetime: '2025-02-06T16:55:37.914Z',
        end_datetime: '2025-01-09T16:56:07.727Z',
    },
}
const timezone = 'UTC'

describe('useTotalConversations', () => {
    it('should return correct metric data when it has custom field definition the query resolves', () => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {
                data: [
                    {id: '1', managed_type: AI_MANAGED_TYPES.AI_OUTCOME},
                    {id: '2', managed_type: AI_MANAGED_TYPES.AI_INTENT},
                    {id: '3', managed_type: 'OTHER_TYPE'},
                ],
            },
        } as unknown as UseQueryResult<
            ApiListResponseCursorPagination<CustomField[]>
        >)

        useMultipleMetricsTrendsMock.mockReturnValue({
            data: {
                [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: {
                    value: 843,
                    prevValue: 754,
                },
            },
            isFetching: false,
        } as any)

        const {result} = renderHook(() =>
            useTotalConversations(filters, timezone)
        )

        expect(result.current).toEqual({
            title: 'Total AI Sales Conversations',
            hint: 'The total number of conversations handled or influenced by the AI Agent for Sales.',
            metricType: StatType.Number,
            metricFormat: 'decimal',
            value: 843,
            prevValue: 754,
            isLoading: false,
        })
    })

    it('should return correct metric data when it has no custom field definition the query resolves', () => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {},
        } as unknown as UseQueryResult<
            ApiListResponseCursorPagination<CustomField[]>
        >)

        useMultipleMetricsTrendsMock.mockReturnValue({
            data: {
                [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: {
                    value: 843,
                    prevValue: 754,
                },
            },
            isFetching: false,
        } as any)

        const {result} = renderHook(() =>
            useTotalConversations(filters, timezone)
        )

        expect(result.current).toEqual({
            title: 'Total AI Sales Conversations',
            hint: 'The total number of conversations handled or influenced by the AI Agent for Sales.',
            metricType: StatType.Number,
            metricFormat: 'decimal',
            value: 843,
            prevValue: 754,
            isLoading: false,
        })
    })

    it('should return loading state when the query is still loading', () => {
        useMultipleMetricsTrendsMock.mockReturnValue({
            isFetching: true,
        } as any)

        const {result} = renderHook(() =>
            useTotalConversations(filters, timezone)
        )

        expect(result.current).toEqual({
            title: 'Total AI Sales Conversations',
            hint: 'The total number of conversations handled or influenced by the AI Agent for Sales.',
            metricType: StatType.Number,
            metricFormat: 'decimal',
            isLoading: true,
        })
    })
})
