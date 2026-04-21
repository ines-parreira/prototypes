import { Box } from '@gorgias/axiom'

import type {
    JsonLogicOrBlock,
    JsonLogicRuleOverVariable,
} from 'models/selfServiceConfiguration/types'
import { JsonLogicOperator } from 'models/selfServiceConfiguration/types'

import { ScenarioConditionRule } from './ScenarioConditionRule'

type Props = {
    value: JsonLogicOrBlock
    onChange: (nextValue: JsonLogicOrBlock) => void
}

const getRuleKey = (rule: JsonLogicRuleOverVariable) => {
    const operator = Object.keys(rule)[0] as JsonLogicOperator
    const variable = (rule[JsonLogicOperator.IS_ONE_OF] ??
        rule[JsonLogicOperator.EQUALS])?.[0]?.var
    return `${variable}-${operator}`
}

export const ScenarioConditionOrBlock = ({ value, onChange }: Props) => {
    const rules = value.or

    const handleRuleChange = (
        nextRule: JsonLogicRuleOverVariable,
        index: number,
    ) => {
        const nextRules = [...rules]
        nextRules[index] = nextRule
        onChange({ or: nextRules })
    }

    const handleRuleDelete = (index: number) => {
        const nextRules = [...rules]
        nextRules.splice(index, 1)
        onChange({ or: nextRules })
    }

    return (
        <Box flexDirection="column" gap="xs">
            {rules.map((rule, index) => (
                <ScenarioConditionRule
                    key={getRuleKey(rule)}
                    value={rule}
                    onChange={(nextValue) => handleRuleChange(nextValue, index)}
                    onDelete={() => handleRuleDelete(index)}
                    conjunction={index > 0 ? 'OR' : undefined}
                />
            ))}
        </Box>
    )
}
