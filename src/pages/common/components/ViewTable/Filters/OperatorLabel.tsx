import {LogicalOperator} from 'estree'
import React from 'react'

import css from './CallExpression.less'

type LabelledOperator = Exclude<LogicalOperator, '??'>
type OperatorLabelProps = {
    operator: LabelledOperator
}

const OPERATOR_LABELS: Record<LabelledOperator, string> = {
    '&&': 'And',
    '||': 'Or',
}

export function OperatorLabel({operator}: OperatorLabelProps) {
    return (
        <span className={css.operatorLabel}>{OPERATOR_LABELS[operator]}</span>
    )
}
