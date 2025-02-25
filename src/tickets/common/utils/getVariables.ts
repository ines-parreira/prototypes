import { Variable, VARIABLES } from 'tickets/common/config'

/**
 * Return variables config
 */
export default function getVariables(
    types: Array<string> | null,
): Array<Variable> {
    if (!types) {
        return VARIABLES.filter((variable) => !variable.explicit)
    }

    return VARIABLES.filter((variables) => types.includes(variables.type))
}
