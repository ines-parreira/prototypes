import React from 'react'
import {Button} from 'reactstrap'
import {LogicalOperator} from 'estree'

type Props = {
    operator: Exclude<LogicalOperator, '??'>
}

export default class OperatorLabel extends React.Component<Props> {
    render() {
        const {operator} = this.props

        const operatorLabels = {
            '&&': 'and',
            '||': 'or',
        }

        return (
            <Button
                className="OperatorLabel btn-sm btn-frozen"
                tag="div"
                color="clue"
            >
                {operatorLabels[operator]}
            </Button>
        )
    }
}
