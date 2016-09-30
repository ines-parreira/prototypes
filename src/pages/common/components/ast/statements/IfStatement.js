import React from 'react'

import { AddActionOrIfStatement, AddLogicalAndCondition } from '../operations'
import Expression from '../expression/Expression'
import Statement from './Statement'

/**
 * Test Expression of the IF Statement
 *
 * @param actions
 * @param index
 * @param parent
 * @param schemas
 * @param test
 * @param context
 * @constructor
 */
let TestExpression = ({actions, index, parent, schemas, test}) => (
    <div className="test">
        <AddLogicalAndCondition
            actions={actions}
            index={index}
            parent={parent.push('test')}
            title="IF"
        />
        <Expression
            {...test}
            parent={parent.push('test')}
            index={index}
            actions={actions}
            schemas={schemas}
        />
    </div>
)

TestExpression.propTypes = {
    actions: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    parent: React.PropTypes.object.isRequired,
    schemas: React.PropTypes.object.isRequired,
    test: React.PropTypes.object.isRequired,
}

/**
 * Consequent Component of the IF Statement
 *
 * @param actions
 * @param consequent
 * @param index
 * @param parent
 * @param schemas
 * @constructor
 */
let ConsequentStatement = ({actions, consequent, index, parent, schemas}) => (
    <div className="consequent">
        <AddActionOrIfStatement
            actions={actions}
            index={index}
            parent={parent.push('consequent')}
            title="THEN"
        />
        <Statement
            {...consequent}
            parent={parent.push('consequent')}
            index={index}
            actions={actions}
            schemas={schemas}
        />
    </div>
)

ConsequentStatement.propTypes = {
    actions: React.PropTypes.object.isRequired,
    consequent: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    parent: React.PropTypes.object.isRequired,
    schemas: React.PropTypes.object.isRequired,
}

/**
 * Alternate Component of the IF Statement
 *
 * @param actions
 * @param alternate
 * @param index
 * @param parent
 * @param schemas
 * @constructor
 */
let AlternateStatement = ({actions, alternate, index, parent, schemas}) => (
    <div className="alternate">
        <AddActionOrIfStatement
            actions={actions}
            index={index}
            parent={parent.push('alternate')}
            title="ELSE"
        />
        <Statement
            {...alternate}
            parent={parent.push('alternate')}
            index={index}
            actions={actions}
            schemas={schemas}
        />
    </div>
)

AlternateStatement.propTypes = {
    actions: React.PropTypes.object.isRequired,
    alternate: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    parent: React.PropTypes.object.isRequired,
    schemas: React.PropTypes.object.isRequired,
}

/**
 * IF Statement Component
 *
 * @param actions
 * @param alternate {Statement}
 * @param consequent {Statement}
 * @param index
 * @param parent
 * @param schemas
 * @param test {Expression}
 * @constructor
 */
const IfStatement = ({ actions, alternate, consequent, index, parent, schemas, test }) => {
    const _alternate = alternate || { type: 'BlockStatement', body: [] }

    return (
        <div className="IfStatement">
            <TestExpression
                actions={actions}
                index={index}
                parent={parent}
                schemas={schemas}
                test={test}
            />
            <ConsequentStatement
                actions={actions}
                consequent={consequent}
                index={index}
                parent={parent}
                schemas={schemas}
            />
            <AlternateStatement
                actions={actions}
                alternate={_alternate}
                index={index}
                parent={parent}
                schemas={schemas}
            />
        </div>
    )
}

IfStatement.propTypes = {
    test: React.PropTypes.object,
    consequent: React.PropTypes.object,
    alternate: React.PropTypes.object,
    index: React.PropTypes.number,
    parent: React.PropTypes.object,
    schemas: React.PropTypes.object,
    actions: React.PropTypes.object,
}

export default IfStatement
