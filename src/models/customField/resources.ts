import client from 'models/api/resources'
import {CustomField, CustomFieldInput} from './types'

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
