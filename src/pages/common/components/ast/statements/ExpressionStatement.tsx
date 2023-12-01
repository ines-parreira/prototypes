import React, {ComponentProps} from 'react'
import {Map, List} from 'immutable'
import classnames from 'classnames'

import {RuleItemActions} from '../../../../settings/rules/types'
import DeleteBlockStatementItem from '../operations/DeleteBlockStatementItem'
import Hoverable from '../../Hoverable'
import Expression from '../expression/Expression'

type Props = {
    rule: Map<any, any>
    expression: Partial<ComponentProps<typeof Expression>>
    parent: List<any>
    actions: RuleItemActions
    schemas: Map<any, any>
    depth: number
    hovered?: boolean
}

const ExpressionStatement = ({
    expression,
    rule,
    actions,
    parent,
    schemas,
    depth,
    hovered = false,
}: Props) => {
    const parentNew = parent.push('expression')

    return (
        <div className={classnames('ExpressionStatement', {hovered})}>
            <DeleteBlockStatementItem
                parent={parent}
                rule={rule}
                actions={actions}
                isDisplayed={hovered}
                type="action"
            />
            <Expression
                {...(expression as ComponentProps<typeof Expression>)}
                parent={parentNew}
                rule={rule}
                actions={actions}
                schemas={schemas}
                depth={depth}
            />
        </div>
    )
}

export default Hoverable(ExpressionStatement)
