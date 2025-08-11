import { Component } from 'react'

import { List, Map } from 'immutable'

import { Tooltip } from '@gorgias/axiom'

import { RuleOperation } from '../../../../../state/rules/types'
import { RuleItemActions } from '../../../../settings/rules/types'

type Props = {
    rule: Map<any, any>
    actions: RuleItemActions
    parent: List<any>
    isDisplayed: boolean
    type: string
}

export default class DeleteBlockStatementItem extends Component<Props> {
    _handleClick = () => {
        const { actions, parent } = this.props
        actions.modifyCodeAST(parent, null, RuleOperation.Delete)
    }

    render() {
        const { isDisplayed, parent, type } = this.props
        const display = isDisplayed ? 'block' : 'none'

        const label = `Delete this ${type}`

        const uniqueId = (parent.toJS() as string[]).join('-')

        return (
            <span
                className="clickable delete-blockstatement"
                style={{ display }}
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
