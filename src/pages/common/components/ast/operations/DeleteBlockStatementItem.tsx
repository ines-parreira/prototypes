import React from 'react'
import {Map, List} from 'immutable'

import {RuleItemActions} from '../../../../settings/rules/detail/components/RuleItem/RuleItem'
import {RuleOperation} from '../../../../../state/rules/types'
import Tooltip from '../../Tooltip'

type Props = {
    rule: Map<any, any>
    actions: RuleItemActions
    parent: List<any>
    isDisplayed: boolean
    type: string
}

export default class DeleteBlockStatementItem extends React.Component<Props> {
    _handleClick = () => {
        const {actions, parent} = this.props
        actions.modifyCodeAST(parent, null, RuleOperation.Delete)
    }

    render() {
        const {isDisplayed, parent, type} = this.props
        const display = isDisplayed ? 'block' : 'none'

        const label = `Delete this ${type}`

        const uniqueId = (parent.toJS() as string[]).join('-')

        return (
            <span
                className="clickable delete-blockstatement"
                style={{display}}
                onClick={this._handleClick}
            >
                <i id={uniqueId} className="material-icons">
                    close
                </i>
                <Tooltip placement="left" target={uniqueId}>
                    {label}
                </Tooltip>
            </span>
        )
    }
}
