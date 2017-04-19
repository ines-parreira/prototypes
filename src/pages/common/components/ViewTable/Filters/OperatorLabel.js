import React, {PropTypes} from 'react'
import {Button} from 'reactstrap'

export default class OperatorLabel extends React.Component {
    static propTypes = {
        operator: PropTypes.string.isRequired,
    }

    render() {
        const {operator} = this.props

        const operatorLabels = {
            '&&': 'and',
            '||': 'or'
        }

        return (
            <Button
                className="OperatorLabel btn-frozen"
                tag="div"
                color="warning"
            >
                {operatorLabels[operator]}
            </Button>
        )
    }
}
