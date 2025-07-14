import css from 'domains/reporting/pages/common/components/Filter/components/LogicalOperator/LogicalOperator.less'
import {
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'domains/reporting/pages/common/components/Filter/constants'
import RadioFieldSet from 'pages/common/forms/RadioFieldSet'

type Props = {
    logicalOperators: LogicalOperatorEnum[]
    selectedLogicalOperator: LogicalOperatorEnum | null
    onChange: (operator: LogicalOperatorEnum) => void
}

const LogicalOperator = ({
    selectedLogicalOperator,
    logicalOperators,
    onChange,
}: Props) => {
    const handleOnChange = (operator: string) => {
        if (logicalOperators.includes(operator as LogicalOperatorEnum)) {
            onChange(operator as LogicalOperatorEnum)
        }
    }

    return (
        <div className={css.container}>
            <RadioFieldSet
                options={logicalOperators.map((operator) => ({
                    value: operator,
                    label: LogicalOperatorLabel[operator],
                }))}
                selectedValue={selectedLogicalOperator}
                onChange={handleOnChange}
                isHorizontal
                className={css.radioFieldSet}
            />
        </div>
    )
}

export default LogicalOperator
