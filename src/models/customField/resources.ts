import client from 'models/api/resources'
import {
    ApiPaginationParams,
    ApiListResponseCursorPagination,
} from 'models/api/types'
import {
    CustomField,
    CustomFieldInput,
    CustomFieldState,
    PartialCustomFieldWithId,
} from './types'

export type ListParams = ApiPaginationParams & {
    archived: boolean
    object_type: CustomFieldInput['object_type']
    search?: string
}

export async function getCustomFields(
    params: ListParams
): Promise<ApiListResponseCursorPagination<CustomField[]>> {
    const response = await client.get<
        ApiListResponseCursorPagination<CustomField[]>
    >('/api/custom-fields/', {
        params,
    })
    return response.data
}

export async function getCustomField(id: number): Promise<CustomField> {
    const response = await client.get<CustomField>(`/api/custom-fields/${id}`)
    return response.data
}

export async function createCustomField(
    data: CustomFieldInput
): Promise<CustomField> {
    const response = await client.post<CustomField>('/api/custom-fields', data)
    return response.data
}

export async function updateCustomField(
    id: number,
    data: CustomFieldInput
): Promise<CustomField> {
    const response = await client.put<CustomField>(
        `/api/custom-fields/${id}`,
        data
    )
    return response.data
}

export async function updateCustomFields(
    data: PartialCustomFieldWithId[]
): Promise<CustomField[]> {
    const response = await client.put<CustomField[]>(
        `/api/custom-fields/`,
        data
    )
    return response.data
}

export async function updatePartialCustomField(
    id: number,
    data: Partial<CustomField>
): Promise<CustomField> {
    const response = await client.put<CustomField>(
        `/api/custom-fields/${id}`,
        data
    )
    return response.data
}

export async function updateCustomFieldValue({
    fieldType,
    holderId,
    fieldId,
    value,
}: {
    fieldType: CustomFieldInput['object_type']
    holderId: number
    fieldId: CustomField['id']
    value: CustomFieldState['value']
}): Promise<{field: CustomField; value: CustomFieldState['value']}> {
    const response = await client.put<{
        field: CustomField
        value: CustomFieldState['value']
    }>(
        `/api/${
            fieldType === 'Ticket' ? 'tickets' : 'customers'
        }/${holderId}/custom-fields/${fieldId}`,
        `"${value || ''}"`,
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    )
    return response.data
}

export async function deleteCustomFieldValue({
    fieldType,
    holderId,
    fieldId,
}: {
    fieldType: CustomFieldInput['object_type']
    holderId: number
    fieldId: CustomField['id']
}): Promise<undefined> {
    await client.delete(
        `/api/${
            fieldType === 'Ticket' ? 'tickets' : 'customers'
        }/${holderId}/custom-fields/${fieldId}`
    )
    return undefined
}
