import React, {ComponentProps} from 'react'
import {List, Map} from 'immutable'

import {
    getSyntaxTreeLeaves,
    SyntaxTree,
} from 'pages/common/components/ast/utils'
import {RuleItemActions} from 'pages/settings/rules/types'
import Widget from 'pages/common/components/ast/Widget'

import Expression from './Expression'

type Props = {
    operator: string
    left: Partial<ComponentProps<typeof Expression>> & SyntaxTree
    right: Partial<ComponentProps<typeof Expression>> & SyntaxTree
    rule: Map<any, any>
    actions: RuleItemActions
    schemas: Map<any, any>
    parent: List<any>
    leftsiblings: Maybe<List<any>>
}

const BinaryExpression = ({
    operator,
    left,
    right,
    rule,
    actions,
    schemas,
    parent,
    leftsiblings,
}: Props) => {
    const parentLeft = parent.push('left')
    const parentRight = parent.push('right')
    const parentOperator = parent.push('operator')

    let leftsiblings2: List<any> | undefined
    let leftsiblings3: List<any> | undefined

    if (leftsiblings) {
        leftsiblings2 = leftsiblings.concat(
            getSyntaxTreeLeaves(left)
        ) as List<any>
        leftsiblings3 = leftsiblings2.push('operators')
    }

    return (
        <span className="BinaryExpression">
            <span className="left">
                <Expression
                    {...(left as ComponentProps<typeof Expression>)}
                    parent={parentLeft}
                    rule={rule}
                    actions={actions}
                    leftsiblings={leftsiblings}
                    className="IdentifierDropdown"
                />
            </span>
            <span className="operator">
                <Widget
                    value={operator}
                    parent={parentOperator}
                    rule={rule}
                    actions={actions}
                    schemas={schemas}
                    leftsiblings={leftsiblings2}
                    className="OperatorDropdown"
                />
            </span>
            <span className="right">
                <Expression
                    {...(right as ComponentProps<typeof Expression>)}
                    parent={parentRight}
                    rule={rule}
                    actions={actions}
                    schemas={schemas}
                    leftsiblings={leftsiblings3}
                    className="IdentifierDropdown"
                />
            </span>
        </span>
    )
}

export default BinaryExpression
