import React from 'react'
import {Map, List} from 'immutable'

import {RuleItemActions} from 'pages/settings/rules/types'
import AddLogicalCondition from '../operations/AddLogicalCondition'
import DeleteBlockStatementItem from '../operations/DeleteBlockStatementItem'
import {computeLeftPadding} from '../utils'

import {ExpressionProps} from '../expression/expressionReference'
import Expression from '../expression/Expression'

const TestExpression = ({
    actions,
    rule,
    parent,
    schemas,
    test,
    depth,
    isHovered,
    onMouseEnter,
    onMouseLeave,
}: TestExpressionProps) => {
    return (
        <div
            className="test"
            style={{paddingLeft: computeLeftPadding(depth)}}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <DeleteBlockStatementItem
                parent={parent}
                rule={rule}
                actions={actions}
                isDisplayed={isHovered}
                type="block"
            />

            <AddLogicalCondition
                actions={actions}
                rule={rule}
                parent={parent.push('test')}
                title="IF"
                hoverableClassName="d-inline-flex"
            />
            <Expression
                {...(test as ExpressionProps)}
                parent={parent.push('test')}
                rule={rule}
                actions={actions}
                schemas={schemas}
                className="IdentifierDropdown"
            />
        </div>
    )
}

type TestExpressionProps = {
    actions: RuleItemActions
    rule: Map<any, any>
    parent: List<any>
    schemas: Map<any, any>
    test: Partial<ExpressionProps>
    depth: number
    onMouseEnter: () => void
    onMouseLeave: () => void
    isHovered: boolean
}
export default TestExpression
