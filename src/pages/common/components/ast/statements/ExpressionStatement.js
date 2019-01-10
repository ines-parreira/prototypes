// @flow
import React from 'react'
import PropTypes from 'prop-types'
import Expression from '../expression/Expression'
import {DeleteBlockStatementItem} from '../operations'
import classnames from 'classnames'
import Hoverable from '../../Hoverable'

/*
 interface ExpressionStatement <: Statement {
 type: "ExpressionStatement";
 expression: Expression;
 }
 */

type Props = {
    rule: Object,
    expression: ?Object,
    parent: Object,
    actions: ?Object,
    schemas: ?Object,
    depth: number
}

class ExpressionStatement extends React.Component<Props> {
    render() {
        const {expression, rule, actions, parent, schemas, depth} = this.props
        const {hovered} = this.context
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
                    {...expression}
                    parent={parentNew}
                    rule={rule}
                    actions={actions}
                    schemas={schemas}
                    depth={depth}
                />
            </div>
        )
    }
}

ExpressionStatement.contextTypes = {
    hovered: PropTypes.bool
}

export default Hoverable(ExpressionStatement)
