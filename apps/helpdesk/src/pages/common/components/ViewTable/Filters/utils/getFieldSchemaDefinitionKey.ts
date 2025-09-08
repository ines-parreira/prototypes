import { CustomField } from 'custom-fields/types'

export default function getFieldSchemaDefinitionKey(
    customField?: CustomField | null,
) {
    if (!customField) return undefined
    const {
        data_type: fieldDataType,
        input_settings: { input_type: fieldInputType },
    } = customField.definition

    if (fieldDataType === 'text' && fieldInputType === 'dropdown')
        return 'dropdown'

    return fieldDataType
}
