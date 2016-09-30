import React from 'react'

export class DeleteBlockStatementItem extends React.Component {

    _handleClick = () => {
        const { actions, index, parent } = this.props
        actions.rules.modifyCodeast(index, parent, null, 'DELETE')
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
    actions: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    parent: React.PropTypes.object.isRequired,
}

export default DeleteBlockStatementItem
