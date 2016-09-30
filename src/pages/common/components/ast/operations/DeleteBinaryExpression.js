import React from 'react'

class DeleteBinaryExpression extends React.Component {

    _handleClick = () => {
        const { actions, index, parent } = this.props
        actions.rules.modifyCodeast(index, parent, null, 'DELETE_BINARY_EXPRESSION')
    }

    render() {
        return (
            <button
                type="button"
                className="ui circular icon mini red button delete-binaryexpression"
                onClick={this._handleClick}
            >
                <i className="remove icon" />
            </button>
        )
    }

}

DeleteBinaryExpression.propTypes = {
    actions: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    parent: React.PropTypes.object.isRequired,
}

export default DeleteBinaryExpression
