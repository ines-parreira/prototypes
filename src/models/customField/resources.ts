import client from 'models/api/resources'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {
    CustomField,
    CustomFieldInput,
    CustomFieldState,
    ListParams,
    PartialCustomFieldWithId,
} from './types'

export async function getCustomFields(params: ListParams) {
    const response = await client.get<
        ApiListResponseCursorPagination<CustomField[]>
    >('/api/custom-fields/', {
        params,
    })
    return response
}

export async function getCustomField(id: number) {
    const response = await client.get<CustomField>(`/api/custom-fields/${id}`)
    return response
}

export async function createCustomField(data: CustomFieldInput) {
    const response = await client.post<CustomField>('/api/custom-fields', data)
    return response
}

export async function updateCustomField(id: number, data: CustomFieldInput) {
    const response = await client.put<CustomField>(
        `/api/custom-fields/${id}`,
        data
    )
    return response
}

export async function updateCustomFields(data: PartialCustomFieldWithId[]) {
    const response = await client.put<CustomField[]>(`/api/custom-fields`, data)
    return response
}

export async function updatePartialCustomField(
    id: number,
    data: Partial<CustomField>
) {
    const response = await client.put<CustomField>(
        `/api/custom-fields/${id}`,
        data
    )
    return response
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
    value?: CustomFieldState['value']
}) {
    const response = await client.put<{
        field: CustomField
        value: CustomFieldState['value']
    }>(
        `/api/${
            fieldType === 'Ticket' ? 'tickets' : 'customers'
        }/${holderId}/custom-fields/${fieldId}`,
        JSON.stringify(value),
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    )
    return response
}

export async function deleteCustomFieldValue({
    fieldType,
    holderId,
    fieldId,
}: {
    fieldType: CustomFieldInput['object_type']
    holderId: number
    fieldId: CustomField['id']
}) {
    await client.delete(
        `/api/${
            fieldType === 'Ticket' ? 'tickets' : 'customers'
        }/${holderId}/custom-fields/${fieldId}`
    )
    return undefined
}
