import React from 'react'

class DeleteBinaryExpression extends React.Component {

    _handleClick = () => {
        const { actions, rule, parent } = this.props
        actions.rules.modifyCodeast(rule.get('id'), parent, null, 'DELETE_BINARY_EXPRESSION')
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
    rule: React.PropTypes.object.isRequired,
    actions: React.PropTypes.object.isRequired,
    parent: React.PropTypes.object.isRequired,
}

export default DeleteBinaryExpression
