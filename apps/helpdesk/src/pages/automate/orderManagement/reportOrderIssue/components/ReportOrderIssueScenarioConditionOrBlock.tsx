import classnames from 'classnames'

import type {
    JsonLogicOrBlock,
    JsonLogicRuleOverVariable,
} from 'models/selfServiceConfiguration/types'

import ReportOrderIssueScenarioConditionRule from './ReportOrderIssueScenarioConditionRule'

import css from './ReportOrderIssueScenarioConditionOrBlock.less'

type Props = {
    value: JsonLogicOrBlock
    isElevated: boolean
    onChange: (nextValue: JsonLogicOrBlock) => void
}

const ReportOrderIssueScenarioConditionOrBlock = ({
    value,
    isElevated,
    onChange,
}: Props) => {
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
        <div
            className={classnames(css.container, {
                [css.isElevated]: isElevated,
            })}
        >
            {rules.map((rule, index) => (
                <ReportOrderIssueScenarioConditionRule
                    key={index}
                    value={rule}
                    onChange={(nextValue) => {
                        handleRuleChange(nextValue, index)
                    }}
                    onDelete={() => {
                        handleRuleDelete(index)
                    }}
                    conjunction={index > 0 ? 'OR' : undefined}
                />
            ))}
        </div>
    )
}

export default ReportOrderIssueScenarioConditionOrBlock
