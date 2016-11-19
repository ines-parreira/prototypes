import React from 'react'

export class DeleteBlockStatementItem extends React.Component {

    _handleClick = () => {
        const { actions, rule, parent } = this.props
        actions.rules.modifyCodeast(rule.get('id'), parent, null, 'DELETE')
    }

    render() {
        return (
            <button
                type="button"
                className="ui mini circular red icon button delete-blockstatement"
                onClick={this._handleClick}
            >
                <i className="remove icon" />
            </button>
        )
    }

}

DeleteBlockStatementItem.propTypes = {
    rule: React.PropTypes.object.isRequired,
    actions: React.PropTypes.object.isRequired,
    parent: React.PropTypes.object.isRequired,
}

export default DeleteBlockStatementItem
