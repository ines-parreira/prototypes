import {CustomField} from 'models/customField/types'

export default function getFieldSchemaDefinitionKey(customField: CustomField) {
    const {
        data_type: fieldDataType,
        input_settings: {input_type: fieldInputType},
    } = customField.definition

    if (fieldDataType === 'text' && fieldInputType === 'dropdown')
        return 'dropdown'

    return fieldDataType
}
