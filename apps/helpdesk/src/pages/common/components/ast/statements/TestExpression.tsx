import type { List, Map } from 'immutable'

import type { RuleItemActions } from 'pages/settings/rules/types'

import Expression from '../expression/Expression'
import type { ExpressionProps } from '../expression/expressionReference'
import AddLogicalCondition from '../operations/AddLogicalCondition'
import DeleteBlockStatementItem from '../operations/DeleteBlockStatementItem'
import { computeLeftPadding } from '../utils'

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
            className="test flex flex-wrap"
            style={{
                paddingLeft: computeLeftPadding(depth),
                alignItems: 'center',
                minHeight: 32,
            }}
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
