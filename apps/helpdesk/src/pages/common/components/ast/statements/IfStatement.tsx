import { Component } from 'react'
import type { ComponentProps } from 'react'

import classnames from 'classnames'
import type { List, Map } from 'immutable'

import type Expression from 'pages/common/components/ast/expression/Expression'
import type { StatementProps } from 'pages/common/hooks/rule/RuleProvider'
import type { RuleItemActions } from 'pages/settings/rules/types'

import AlternateStatement from './AlternateStatement'
import { ConsequentStatement } from './ConsequentStatement'
import TestExpression from './TestExpression'

/**
 * IF Statement Component
 */

type IfStatementProps = {
    rule: Map<any, any>
    test: Partial<ComponentProps<typeof Expression>>
    consequent: Partial<ComponentProps<typeof Expression>>
    alternate?: Partial<StatementProps>
    parent: List<any>
    schemas: Map<any, any>
    actions: RuleItemActions
    depth: number
}

type IfStatementState = {
    isHovered: boolean
}

export default class IfStatement extends Component<
    IfStatementProps,
    IfStatementState
> {
    state = {
        isHovered: false,
    }

    render() {
        const {
            actions,
            alternate,
            consequent,
            rule,
            parent,
            schemas,
            test,
            depth,
        } = this.props
        const { isHovered } = this.state

        return (
            <div className={classnames('IfStatement', { hovered: isHovered })}>
                <TestExpression
                    actions={actions}
                    rule={rule}
                    parent={parent}
                    schemas={schemas}
                    test={test}
                    depth={depth}
                    onMouseEnter={() => this.setState({ isHovered: true })}
                    onMouseLeave={() => this.setState({ isHovered: false })}
                    isHovered={isHovered}
                />
                <ConsequentStatement
                    actions={actions}
                    consequent={consequent}
                    rule={rule}
                    parent={parent}
                    schemas={schemas}
                    depth={depth}
                />
                {alternate && (
                    <AlternateStatement
                        actions={actions}
                        alternate={alternate}
                        rule={rule}
                        parent={parent}
                        schemas={schemas}
                        depth={depth}
                    />
                )}
            </div>
        )
    }
}
