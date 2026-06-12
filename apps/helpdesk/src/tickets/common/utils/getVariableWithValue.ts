import { HIDDEN_VARIABLES, PREVIOUS_VARIABLES } from 'tickets/common/config'
import type { Variable } from 'tickets/common/config'

import { createMetafieldVariable } from './createMetafieldVariable'
import { getVariablesList } from './getVariablesList'

export function getVariableWithValue(value: string): Variable | undefined {
    const variables = getVariablesList()
    const hiddenVariables = getVariablesList(HIDDEN_VARIABLES)
    const previousVariables = getVariablesList(PREVIOUS_VARIABLES)

    return (
        variables.find((item) => item.value === value) ||
        previousVariables.find((item) => item.value === value) ||
        hiddenVariables.find((item) => item.value === value) ||
        createMetafieldVariable(value)
    )
}
