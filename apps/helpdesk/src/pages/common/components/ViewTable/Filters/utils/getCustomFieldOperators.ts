import { BASIC_OPERATORS } from 'config'
import { CustomField } from 'custom-fields/types'
import { OperatorType } from 'pages/common/components/ViewTable/Filters/types'
import { Schemas } from 'types'
import { findProperty } from 'utils'

import getFieldSchemaDefinitionKey from './getFieldSchemaDefinitionKey'

export default function getCustomFieldOperators(
    schemas: Schemas,
    customField?: CustomField,
) {
    const customFieldSchemas = findProperty('ticket.custom_fields', schemas)

    const fieldOperatorsSchema = customFieldSchemas?.meta?.operators as
        | Record<string, Record<string, OperatorType>>
        | undefined

    if (fieldOperatorsSchema && !!customField) {
        const schemaDefinitionKey = getFieldSchemaDefinitionKey(customField)

        return fieldOperatorsSchema[schemaDefinitionKey]
    }

    return BASIC_OPERATORS
}
