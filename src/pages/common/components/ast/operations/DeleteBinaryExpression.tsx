import {List, Map} from 'immutable'
import React from 'react'

import {RuleItemActions} from 'pages/settings/rules/types'
import {RuleOperation} from 'state/rules/types'

type Props = {
    rule: Map<any, any>
    actions: RuleItemActions
    parent: List<any>
}

export default function DeleteBinaryExpression({actions, parent}: Props) {
    const handleClick = () => {
        actions.modifyCodeAST(
            parent,
            null,
            RuleOperation.DeleteBinaryExpression
        )
    }
    return (
        <i
            className="material-icons text-danger clickable"
            onClick={handleClick}
        >
            clear
        </i>
    )
}
