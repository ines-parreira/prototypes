// @flow
import React from 'react'
import Tooltip from '../../Tooltip'



type Props = {
    rule: Object,
    actions: Object,
    parent: Object,
    isDisplayed: boolean,
    type: string
}

export default class DeleteBlockStatementItem extends React.Component<Props> {
    _handleClick = () => {
        const {actions, parent} = this.props
        actions.modifyCodeAST(parent, null, 'DELETE')
    }

    render() {
        const {isDisplayed, parent, type} = this.props
        const display = isDisplayed ? 'block' : 'none'

        let label = `Delete this ${type}`

        const uniqueId = parent.toJS().join('-')

        return (
            <span
                className="fa-stack clickable delete-blockstatement"
                style={{display}}
                onClick={this._handleClick}
            >
                <i id={uniqueId} className="material-icons">close</i>
                <Tooltip
                    placement="top"
                    target={uniqueId}
                >
                    {label}
                </Tooltip>
            </span>
        )
    }

}
