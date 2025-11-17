import { useMemo } from 'react'

import { getDisplayValue } from 'pages/automate/workflows/editor/visualBuilder/editors/ConditionsNodeEditor/conditions/NumberConditionType'
import { getOperatorListByVariable } from 'pages/automate/workflows/editor/visualBuilder/editors/ConditionsNodeEditor/constants'
import type { ConditionSchema } from 'pages/automate/workflows/models/conditions.types'
import { parseWorkflowVariable } from 'pages/automate/workflows/models/variables.model'
import type { WorkflowVariableList } from 'pages/automate/workflows/models/variables.types'

type Props = {
    variables: WorkflowVariableList
    conditions: ConditionSchema[]
}

const useHumanReadableOrderConditions = ({ variables, conditions }: Props) => {
    return useMemo(() => {
        const messages: string[] = []

        conditions.forEach((condition) => {
            const key = Object.keys(condition)[0] as AllKeys<typeof condition>
            const schema = condition[key]!

            const variableInUse = schema[0].var
            const variable = parseWorkflowVariable(variableInUse, variables)

            if (!variable || variable.nodeType !== 'order_selection') {
                return
            }

            const operators = getOperatorListByVariable(variable)
            const operator = operators.find((operator) => operator.key === key)

            if (!operator) {
                return
            }

            if (key !== 'exists' && key !== 'doesNotExist') {
                let displayValue = schema[1]

                if (
                    typeof schema[1] === 'number' &&
                    variable.type === 'number'
                ) {
                    displayValue = getDisplayValue(schema[1], variable.format)
                }

                if (variable.type === 'string' && variable.options) {
                    displayValue =
                        variable.options.find(
                            (option) => option.value === schema[1],
                        )?.label ?? schema[1]
                }

                messages.push(
                    `${variable.name} ${operator.label.toLowerCase()} ${displayValue}`,
                )
            } else {
                messages.push(
                    `${variable.name} ${operator.label.toLowerCase()}`,
                )
            }
        })

        return messages
    }, [variables, conditions])
}

export default useHumanReadableOrderConditions
