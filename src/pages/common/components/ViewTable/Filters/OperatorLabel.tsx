import React from 'react'
import {LogicalOperator} from 'estree'
import classNames from 'classnames'

import Button from '../../button/Button'

import css from './OperatorLabel.less'

type Props = {
    operator: Exclude<LogicalOperator, '??'>
}

export default class OperatorLabel extends React.Component<Props> {
    render() {
        const {operator} = this.props

        const operatorLabels = {
            '&&': 'AND',
            '||': 'OR',
        }

        return (
            <Button
                className={classNames(
                    'OperatorLabel',
                    'btn-frozen',
                    css.operatorLabel
                )}
            >
                {operatorLabels[operator]}
            </Button>
        )
    }
}
