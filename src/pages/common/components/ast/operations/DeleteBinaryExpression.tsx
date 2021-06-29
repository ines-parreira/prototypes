import React from 'react'
import {List, Map} from 'immutable'

import {RuleItemActions} from '../../../../settings/rules/detail/components/RuleItem/RuleItem'
import {RuleOperation} from '../../../../../state/rules/types'

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
            className="material-icons text-danger remove clickable delete-binaryexpression"
            onClick={handleClick}
        >
            clear
        </i>
    )
}
