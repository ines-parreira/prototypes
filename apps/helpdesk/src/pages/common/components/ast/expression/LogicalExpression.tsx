import type { List, Map } from 'immutable'

import AddSiblingCondition from 'pages/common/components/ast/operations/AddSiblingCondition'
import type { SyntaxTree } from 'pages/common/components/ast/utils'
import { getSyntaxTreeLeaves } from 'pages/common/components/ast/utils'
import type { ExpressionProps } from 'pages/common/hooks/rule/RuleProvider'
import { useRuleContext } from 'pages/common/hooks/useRuleContext'
import type { RuleItemActions } from 'pages/settings/rules/types'

type LogicalExpressionProps = {
    rule: Map<any, any>
    actions: RuleItemActions
    left: Partial<ExpressionProps> & SyntaxTree
    leftsiblings?: List<any>
    parent: List<any>
    right: Partial<ExpressionProps> & SyntaxTree
    schemas: Map<any, any>
}

export default function LogicalExpression({
    left,
    right,
    rule,
    parent,
    actions,
    leftsiblings,
    schemas,
}: LogicalExpressionProps) {
    const { Expression } = useRuleContext()

    let leftsiblings2
    let leftsiblings3

    if (leftsiblings) {
        leftsiblings2 = leftsiblings.concat(
            getSyntaxTreeLeaves(left),
        ) as List<any>
        leftsiblings3 = leftsiblings2.push('operator')
    }

    return (
        <>
            <Expression
                {...(left as ExpressionProps)}
                parent={parent.push('left')}
                rule={rule}
                actions={actions}
                schemas={schemas}
                leftsiblings={leftsiblings}
                className="IdentifierDropdown"
            />
            <div
                className="w-100 d-flex align-items-baseline"
                style={{
                    gap: 'var(--spacing-xxs)',
                    width: '100%',
                }}
            >
                <AddSiblingCondition
                    actions={actions}
                    rule={rule}
                    parent={parent}
                    hoverableClassName="d-inline-flex"
                />
                <Expression
                    {...(right as ExpressionProps)}
                    parent={parent.push('right')}
                    rule={rule}
                    actions={actions}
                    schemas={schemas}
                    leftsiblings={leftsiblings3}
                    className="IdentifierDropdown"
                />
            </div>
        </>
    )
}
