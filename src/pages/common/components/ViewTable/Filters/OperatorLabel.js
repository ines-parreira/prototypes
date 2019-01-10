import React from 'react'
import PropTypes from 'prop-types'
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
                className="OperatorLabel btn-sm btn-frozen"
                tag="div"
                color="clue"
            >
                {operatorLabels[operator]}
            </Button>
        )
    }
}
