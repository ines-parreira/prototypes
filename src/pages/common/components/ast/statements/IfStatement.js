import React from 'react'

import classnames from 'classnames'

import {AddActionOrIfStatement, AddLogicalCondition, DeleteBlockStatementItem} from '../operations'
import Expression from '../expression/Expression'
import {computeLeftPadding} from '../utils'
import Foldable from '../Foldable'

import Statement from './Statement'

/**
 * Test Expression of the IF Statement
 */
class TestExpression extends React.Component<TestExpressionProps> {
    render() {
        const {actions, rule, parent, schemas, test, depth, isHovered, onMouseEnter, onMouseLeave} = this.props

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
                    {...test}
                    parent={parent.push('test')}
                    rule={rule}
                    actions={actions}
                    schemas={schemas}
                    className="IdentifierDropdown"
                />
            </div>
        )
    }
}

type TestExpressionProps = {
    actions: Object,
    rule: Object,
    parent: Object,
    schemas: Object,
    test: Object,
    depth: number,
    onMouseEnter: () => void,
    onMouseLeave: () => void,
    isHovered: boolean,
}

/**
 * Consequent Component of the IF Statement
 */

type ConsequentStatementProps = {
    rule: Object,
    actions: Object,
    consequent: Object,
    parent: Object,
    schemas: Object,
    depth: number,
}

class ConsequentStatement extends React.Component<ConsequentStatementProps> {
    render() {
        const {actions, consequent, rule, parent, schemas, depth} = this.props

        return (
            <div className="consequent">
                <Foldable
                    label={(
                        <AddActionOrIfStatement
                            actions={actions}
                            rule={rule}
                            parent={parent.push('consequent')}
                            title="THEN"
                            hoverableClassName="d-inline-flex"
                            depth={depth}
                        />
                    )}
                >
                    <Statement
                        {...consequent}
                        parent={parent.push('consequent')}
                        rule={rule}
                        actions={actions}
                        schemas={schemas}
                        depth={depth + 1}
                    />
                </Foldable>
            </div>
        )
    }
}

/**
 * Alternate Component of the IF Statement
 */

class AlternateStatement extends React.Component<AlternateStatementProps> {
    render() {
        const {actions, alternate, rule, parent, schemas, depth} = this.props

        return (
            <div className="alternate">
                <Foldable
                    label={(
                        <AddActionOrIfStatement
                            actions={actions}
                            rule={rule}
                            parent={parent.push('alternate')}
                            title="ELSE"
                            hoverableClassName="d-inline-flex"
                            depth={depth}
                            removable
                        />
                    )}
                >
                    <Statement
                        {...alternate}
                        parent={parent.push('alternate')}
                        rule={rule}
                        actions={actions}
                        schemas={schemas}
                        depth={depth + 1}
                    />
                </Foldable>
            </div>
        )
    }
}

type AlternateStatementProps = {
    rule: Object,
    actions: Object,
    alternate: Object,
    parent: Object,
    schemas: Object,
    depth: number,
}



/**
 * IF Statement Component
 */

type IfStatementProps = {
    rule: ?Object,
    test: ?Object,
    consequent: ?Object,
    alternate: ?Object,
    parent: ?Object,
    schemas: ?Object,
    actions: ?Object,
    depth: number,
}

type IfStatementState = {
    isHovered: boolean
}

export default class IfStatement extends React.Component<IfStatementProps, IfStatementState> {
    state = {
        isHovered: false
    }

    render() {
        const {actions, alternate, consequent, rule, parent, schemas, test, depth} = this.props
        const {isHovered} = this.state

        return (
            <div className={classnames('IfStatement', {hovered: isHovered})}>
                <TestExpression
                    actions={actions}
                    rule={rule}
                    parent={parent}
                    schemas={schemas}
                    test={test}
                    depth={depth}
                    onMouseEnter={() => this.setState({isHovered: true})}
                    onMouseLeave={() => this.setState({isHovered: false})}
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
                {
                    alternate && (
                        <AlternateStatement
                            actions={actions}
                            alternate={alternate}
                            rule={rule}
                            parent={parent}
                            schemas={schemas}
                            depth={depth}
                        />
                    )
                }
            </div>
        )
    }
}
