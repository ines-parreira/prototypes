import client from 'models/api/resources'
import {
    CustomField,
    CustomFieldInput,
    CustomFieldState,
    GetCustomFieldDefinitionsResponse,
    ListParams,
    PartialCustomFieldWithId,
} from './types'

export async function getCustomFields(params: ListParams) {
    const res = await client.get<GetCustomFieldDefinitionsResponse>(
        '/api/custom-fields/',
        {
            params,
        }
    )
    return res
}

export async function getCustomField(id: number) {
    const response = await client.get<CustomField>(`/api/custom-fields/${id}`)
    return response
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
        JSON.stringify(value),
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
