import {CustomField} from 'custom-fields/types'
import {Schemas} from 'types'

import {getCustomFieldOperators} from './'

export default function getDefaultCustomFieldOperator(
    schemas: Schemas,
    customField?: CustomField
) {
    const operators = getCustomFieldOperators(schemas, customField)

    return Object.keys(operators)[0]
}
