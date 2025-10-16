import { BASIC_OPERATORS } from 'config'
import { CustomField } from 'custom-fields/types'
import { CustomFieldTreePath } from 'models/rule/types'
import { OperatorType } from 'pages/common/components/ViewTable/Filters/types'
import { Schemas } from 'types'
import { findProperty } from 'utils'

import getFieldSchemaDefinitionKey from './getFieldSchemaDefinitionKey'

export default function getCustomFieldOperators(
    schemas: Schemas,
    customField?: CustomField | null,
    path = CustomFieldTreePath.Ticket,
) {
    const customFieldSchemas = findProperty(path, schemas)

    const fieldOperatorsSchema = customFieldSchemas?.meta?.operators as
        | Record<string, Record<string, OperatorType>>
        | undefined

    const schemaDefinitionKey = getFieldSchemaDefinitionKey(customField)

    if (fieldOperatorsSchema && !!schemaDefinitionKey) {
        return fieldOperatorsSchema[schemaDefinitionKey]
    }

    return BASIC_OPERATORS
}
