import { UseQueryResult } from '@tanstack/react-query'

import { AI_MANAGED_TYPES } from 'custom-fields/constants'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { CustomField } from 'custom-fields/types'
import { ApiListResponseCursorPagination } from 'models/api/types'
import { renderHook } from 'utils/testing/renderHook'

import { useGetCustomTicketsFieldsDefinitionData } from '../useGetCustomTicketsFieldsDefinitionData'

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = jest.mocked(useCustomFieldDefinitions)

describe('useGetCustomTicketsFieldsDefinitionData', () => {
    it('should return the correct custom field IDs for outcome and intent', () => {
        const mockData = {
            data: {
                data: [
                    { id: '1', managed_type: AI_MANAGED_TYPES.AI_OUTCOME },
                    { id: '2', managed_type: AI_MANAGED_TYPES.AI_INTENT },
                    { id: '3', managed_type: 'OTHER_TYPE' },
                ],
            },
        } as unknown as UseQueryResult<
            ApiListResponseCursorPagination<CustomField[]>,
            unknown
        >

        useCustomFieldDefinitionsMock.mockReturnValue(mockData)

        const { result } = renderHook(() =>
            useGetCustomTicketsFieldsDefinitionData(),
        )

        expect(result.current).toEqual({
            outcomeCustomFieldId: '1',
            intentCustomFieldId: '2',
        })
    })

    it('should return undefined if the custom fields are not found', () => {
        const mockData = {
            data: {
                data: [{ id: '3', managed_type: 'OTHER_TYPE' }],
            },
        } as unknown as UseQueryResult<
            ApiListResponseCursorPagination<CustomField[]>,
            unknown
        >

        useCustomFieldDefinitionsMock.mockReturnValue(mockData)

        const { result } = renderHook(() =>
            useGetCustomTicketsFieldsDefinitionData(),
        )

        expect(result.current).toEqual({
            outcomeCustomFieldId: -1,
            intentCustomFieldId: -1,
        })
    })

    it('should handle empty data gracefully', () => {
        const mockData = { data: { data: [] } } as unknown as UseQueryResult<
            ApiListResponseCursorPagination<CustomField[]>,
            unknown
        >

        useCustomFieldDefinitionsMock.mockReturnValue(mockData)

        const { result } = renderHook(() =>
            useGetCustomTicketsFieldsDefinitionData(),
        )

        expect(result.current).toEqual({
            outcomeCustomFieldId: -1,
            intentCustomFieldId: -1,
        })
    })
})
