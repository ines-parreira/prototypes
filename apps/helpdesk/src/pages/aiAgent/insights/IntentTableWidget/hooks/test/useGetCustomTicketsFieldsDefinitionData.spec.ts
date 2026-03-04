import { assumeMock, renderHook } from '@repo/testing'

import { listCustomFields } from '@gorgias/helpdesk-client'

import { AI_MANAGED_TYPES } from 'custom-fields/constants'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import type { CustomField } from 'custom-fields/types'
import { activeParams } from 'domains/reporting/pages/ticket-insights/ticket-fields/CustomFieldSelect'
import {
    fetchCustomTicketsFieldsDefinitionData,
    TICKET_FIELD_ID_NOT_AVAILABLE,
    useGetCustomTicketsFieldsDefinitionData,
} from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
jest.mock('@gorgias/helpdesk-client')

const useCustomFieldDefinitionsMock = jest.mocked(useCustomFieldDefinitions)
const listCustomFieldsMock = assumeMock(listCustomFields)

describe('useGetCustomTicketsFieldsDefinitionData', () => {
    it('should return the correct custom field IDs for outcome and intent', () => {
        const mockData = {
            data: {
                data: [
                    {
                        id: '1',
                        managed_type: AI_MANAGED_TYPES.AI_OUTCOME,
                    },
                    { id: '2', managed_type: AI_MANAGED_TYPES.AI_INTENT },
                    {
                        id: '3',
                        managed_type: AI_MANAGED_TYPES.MANAGED_SENTIMENT,
                    },
                ] as unknown as CustomField[],
            },
        } as ReturnType<typeof useCustomFieldDefinitions>

        useCustomFieldDefinitionsMock.mockReturnValue(mockData)

        const { result } = renderHook(() =>
            useGetCustomTicketsFieldsDefinitionData(),
        )

        expect(result.current).toEqual({
            outcomeCustomFieldId: '1',
            intentCustomFieldId: '2',
            sentimentCustomFieldId: '3',
        })
    })

    it('should return undefined if the custom fields are not found', () => {
        const mockData = {
            data: {
                data: [
                    {
                        id: '3',
                        managed_type: 'OTHER_TYPE',
                    } as unknown as CustomField,
                ],
            },
        } as ReturnType<typeof useCustomFieldDefinitions>

        useCustomFieldDefinitionsMock.mockReturnValue(mockData)

        const { result } = renderHook(() =>
            useGetCustomTicketsFieldsDefinitionData(),
        )

        expect(result.current).toEqual({
            outcomeCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
            intentCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
            sentimentCustomFieldId: null,
        })
    })

    it('should handle empty data gracefully', () => {
        const mockData = {
            data: { data: [] as CustomField[] },
        } as ReturnType<typeof useCustomFieldDefinitions>

        useCustomFieldDefinitionsMock.mockReturnValue(mockData)

        const { result } = renderHook(() =>
            useGetCustomTicketsFieldsDefinitionData(),
        )

        expect(result.current).toEqual({
            outcomeCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
            intentCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
            sentimentCustomFieldId: null,
        })
    })
})

describe('fetchCustomTicketsFieldsDefinitionData', () => {
    it('should return correct IDs for all field types', async () => {
        listCustomFieldsMock.mockResolvedValue({
            data: {
                data: [
                    { id: '1', managed_type: AI_MANAGED_TYPES.AI_OUTCOME },
                    { id: '2', managed_type: AI_MANAGED_TYPES.AI_INTENT },
                    {
                        id: '3',
                        managed_type: AI_MANAGED_TYPES.MANAGED_SENTIMENT,
                    },
                ] as unknown as CustomField[],
            },
        } as Awaited<ReturnType<typeof listCustomFields>>)

        const result = await fetchCustomTicketsFieldsDefinitionData()

        expect(result).toEqual({
            outcomeCustomFieldId: '1',
            intentCustomFieldId: '2',
            sentimentCustomFieldId: '3',
        })
    })

    it('should return fallback values when fields are not found', async () => {
        listCustomFieldsMock.mockResolvedValue({
            data: {
                data: [
                    {
                        id: '3',
                        managed_type: 'OTHER_TYPE',
                    } as unknown as CustomField,
                ],
            },
        } as Awaited<ReturnType<typeof listCustomFields>>)

        const result = await fetchCustomTicketsFieldsDefinitionData()

        expect(result).toEqual({
            outcomeCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
            intentCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
            sentimentCustomFieldId: null,
        })
    })

    it('should handle empty fields list', async () => {
        listCustomFieldsMock.mockResolvedValue({
            data: { data: [] as CustomField[] },
        } as Awaited<ReturnType<typeof listCustomFields>>)

        const result = await fetchCustomTicketsFieldsDefinitionData()

        expect(result).toEqual({
            outcomeCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
            intentCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
            sentimentCustomFieldId: null,
        })
    })

    it('should call listCustomFields with activeParams', async () => {
        listCustomFieldsMock.mockResolvedValue({
            data: { data: [] as CustomField[] },
        } as Awaited<ReturnType<typeof listCustomFields>>)

        await fetchCustomTicketsFieldsDefinitionData()

        expect(listCustomFieldsMock).toHaveBeenCalledWith(activeParams)
    })
})
