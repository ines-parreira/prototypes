import {Variable, VARIABLES} from 'tickets/common/config'

/**
 * Return array of configs of variables
 * Autocomplete fullName and type properties of each config
 */
export default function getVariablesList(
    variablesList: Array<Variable> = VARIABLES
): Array<Variable> {
    const variables: Variable[] = []

    variablesList.forEach((category) => {
        if (category.children !== undefined) {
            category.children.forEach((variable) => {
                const object = {
                    ...variable,
                    fullName: variable.fullName || variable.name,
                } as Variable

                if (category.type) {
                    object.type = category.type
                }

                if (category.integration) {
                    object.integration = category.integration
                }

                variables.push(object)
            })
        } else {
            variables.push({
                value: category.value,
                type: category.type,
                fullName: category.fullName || category.name,
            } as Variable)
        }
    })

    return variables
}
