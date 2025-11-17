import type { CustomField } from 'custom-fields/types'
import type { Schemas } from 'types'

import getCustomFieldOperators from './getCustomFieldOperators'

export default function getDefaultCustomFieldOperator(
    schemas: Schemas,
    customField?: CustomField,
) {
    const operators = getCustomFieldOperators(schemas, customField)

    return Object.keys(operators)[0]
}
