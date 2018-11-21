import React from 'react'

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
    rule: React.PropTypes.object.isRequired,
    actions: React.PropTypes.object.isRequired,
    parent: React.PropTypes.object.isRequired,
}

export default DeleteBinaryExpression
