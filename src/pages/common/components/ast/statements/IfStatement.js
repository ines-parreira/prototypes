import React from 'react'

import {AddActionOrIfStatement, AddLogicalCondition, DeleteBlockStatementItem} from '../operations'
import Expression from '../expression/Expression'
import Statement from './Statement'

/**
 * Test Expression of the IF Statement
 *
 * @param actions
 * @param rule
 * @param parent
 * @param schemas
 * @param test
 * @constructor
 */
let TestExpression = ({actions, rule, parent, schemas, test}) => (
    <div className="test">
        <DeleteBlockStatementItem
            parent={parent}
            rule={rule}
            actions={actions}
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
        />
    </div>
)

TestExpression.propTypes = {
    actions: React.PropTypes.object.isRequired,
    rule: React.PropTypes.object.isRequired,
    parent: React.PropTypes.object.isRequired,
    schemas: React.PropTypes.object.isRequired,
    test: React.PropTypes.object.isRequired,
}

/**
 * Consequent Component of the IF Statement
 *
 * @param actions
 * @param consequent
 * @param rule
 * @param parent
 * @param schemas
 * @constructor
 */
let ConsequentStatement = ({actions, consequent, rule, parent, schemas}) => (
    <div className="consequent">
        <AddActionOrIfStatement
            actions={actions}
            rule={rule}
            parent={parent.push('consequent')}
            title="THEN"
            hoverableClassName="d-inline-flex"
        />
        <Statement
            {...consequent}
            parent={parent.push('consequent')}
            rule={rule}
            actions={actions}
            schemas={schemas}
        />
    </div>
)

ConsequentStatement.propTypes = {
    rule: React.PropTypes.object.isRequired,
    actions: React.PropTypes.object.isRequired,
    consequent: React.PropTypes.object.isRequired,
    parent: React.PropTypes.object.isRequired,
    schemas: React.PropTypes.object.isRequired,
}

/**
 * Alternate Component of the IF Statement
 *
 * @param actions
 * @param alternate
 * @param rule
 * @param parent
 * @param schemas
 * @constructor
 */
let AlternateStatement = ({actions, alternate, rule, parent, schemas}) => (
    <div className="alternate">
        <AddActionOrIfStatement
            actions={actions}
            rule={rule}
            parent={parent.push('alternate')}
            title="ELSE"
            hoverableClassName="d-inline-flex"
        />
        <Statement
            {...alternate}
            parent={parent.push('alternate')}
            rule={rule}
            actions={actions}
            schemas={schemas}
        />
    </div>
)

AlternateStatement.propTypes = {
    rule: React.PropTypes.object.isRequired,
    actions: React.PropTypes.object.isRequired,
    alternate: React.PropTypes.object.isRequired,
    parent: React.PropTypes.object.isRequired,
    schemas: React.PropTypes.object.isRequired,
}

/**
 * IF Statement Component
 *
 * @param actions
 * @param alternate {Statement}
 * @param consequent {Statement}
 * @param rule
 * @param parent
 * @param schemas
 * @param test {Expression}
 * @constructor
 */
const IfStatement = ({actions, alternate, consequent, rule, parent, schemas, test}) => {
    const _alternate = alternate || {type: 'BlockStatement', body: []}

    return (
        <div className="IfStatement">
            <TestExpression
                actions={actions}
                rule={rule}
                parent={parent}
                schemas={schemas}
                test={test}
            />
            <ConsequentStatement
                actions={actions}
                consequent={consequent}
                rule={rule}
                parent={parent}
                schemas={schemas}
            />
            <AlternateStatement
                actions={actions}
                alternate={_alternate}
                rule={rule}
                parent={parent}
                schemas={schemas}
            />
        </div>
    )
}

IfStatement.propTypes = {
    rule: React.PropTypes.object,
    test: React.PropTypes.object,
    consequent: React.PropTypes.object,
    alternate: React.PropTypes.object,
    parent: React.PropTypes.object,
    schemas: React.PropTypes.object,
    actions: React.PropTypes.object,
}

export default IfStatement
