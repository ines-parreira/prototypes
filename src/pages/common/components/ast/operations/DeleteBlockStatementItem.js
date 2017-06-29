import React from 'react'

export class DeleteBlockStatementItem extends React.Component {

    _handleClick = () => {
        const {actions, parent} = this.props
        actions.modifyCodeAST(parent, null, 'DELETE')
    }

    render() {
        return (
            <span
                className="fa-stack clickable delete-blockstatement"
                onClick={this._handleClick}
            >
                <i className="fa fa-circle text-danger fa-stack-2x" />
                <i className="fa fa-times fa-stack-1x" />
            </span>
        )
    }

}

DeleteBlockStatementItem.propTypes = {
    rule: React.PropTypes.object.isRequired,
    actions: React.PropTypes.object.isRequired,
    parent: React.PropTypes.object.isRequired,
}

export default DeleteBlockStatementItem
