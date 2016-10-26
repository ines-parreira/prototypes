import React, {PropTypes} from 'react'

const RemoveCallExpression = ({index, onClick}) => (
    <i className="remove circle red large action icon" onClick={() => onClick(index)}/>
)
RemoveCallExpression.propTypes = {
    index: PropTypes.number.isRequired,
    onClick: PropTypes.func.isRequired
}

export default RemoveCallExpression
