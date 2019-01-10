import React from 'react'
import PropTypes from 'prop-types'

class DeleteBinaryExpression extends React.Component {

    _handleClick = () => {
        const {actions, parent} = this.props
        actions.modifyCodeAST(parent, null, 'DELETE_BINARY_EXPRESSION')
    }

    render() {
        return (
            <i
                className="material-icons text-danger remove clickable delete-binaryexpression"
                onClick={this._handleClick}
            >
                clear
            </i>
        )
    }

}

DeleteBinaryExpression.propTypes = {
    rule: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    parent: PropTypes.object.isRequired,
}

export default DeleteBinaryExpression
