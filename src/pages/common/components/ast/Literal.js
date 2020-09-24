// @flow
import React from 'react'

import {UNARY_OPERATORS} from '../../../../config.ts'

import Errors from './Errors'
import Widget from './Widget'

/*
 interface Literal <: Node, Expression {
 type: "Literal";
 value: string | boolean | null | number | RegExp;
 }
 */

type Props = {
    callee?: Object,
    rule: Object,
    actions: Object,
    leftsiblings: Object,
    parent: Object,
    schemas: Object,
    value: number | string | boolean,
}

const Literal = ({
    value,
    rule,
    actions,
    parent,
    leftsiblings,
    schemas,
    callee,
}: Props) => {
    const parentNew = parent.push('value')
    const operator = callee && callee.name ? callee.name : ''
    const hasUnaryOperator = Object.keys(UNARY_OPERATORS).includes(operator)

    if (hasUnaryOperator) {
        return null
    }

    return (
        <span className="Literal">
            <Widget
                value={value}
                parent={parentNew}
                rule={rule}
                actions={actions}
                schemas={schemas}
                leftsiblings={leftsiblings}
                className="LiteralWidget"
                compact
            />
            {value === '' && <Errors inline>This field cannot be empty</Errors>}
        </span>
    )
}

export default Literal
