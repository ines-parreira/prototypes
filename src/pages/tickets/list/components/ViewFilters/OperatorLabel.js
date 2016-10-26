import React, {PropTypes} from 'react'

const OperatorLabel = ({operator}) => {
    const operatorLabels = {
        '&&': 'AND',
        '||': 'OR'
    }

    return <span className="ui light blue button OperatorLabel">{operatorLabels[operator]}</span>
}

OperatorLabel.propTypes = {
    operator: PropTypes.string.isRequired
}

export default OperatorLabel
