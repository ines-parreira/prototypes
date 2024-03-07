import {ConditionSchema} from 'pages/automate/workflows/models/conditions.types'
import {WorkflowVariable} from 'pages/automate/workflows/models/variables.types'

export const buildConditionSchemaByVariableType = (
    type: WorkflowVariable['type'],
    variable: string
): ConditionSchema => {
    switch (type) {
        case 'string':
            return {
                equals: [{var: variable}, null],
            }
        case 'number':
            return {
                equals: [{var: variable}, 0],
            }
        case 'boolean':
            return {
                equals: [{var: variable}, true],
            }
        case 'date':
            return {
                lessThan: [{var: variable}, null],
            }
        default:
            return {
                exists: [{var: variable}],
            }
    }
}
