import client from 'models/api/resources'
import {CustomField, CustomFieldInput} from './types'

export async function createCustomField(
    data: CustomFieldInput
): Promise<CustomField> {
    const response = await client.post<CustomField>('/api/custom-fields', data)
    return response.data
}
