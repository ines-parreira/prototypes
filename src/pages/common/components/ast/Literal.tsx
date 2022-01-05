import React from 'react'
import {Map, List} from 'immutable'

import {RuleItemActions} from '../../../settings/rules/types'
import {UNARY_OPERATORS} from '../../../../config'

import Errors from './Errors'
import Widget from './Widget'

type Props = {
    callee?: {name?: string}
    rule: Map<any, any>
    actions: RuleItemActions
    leftsiblings: List<any>
    parent: List<any>
    schemas: Map<any, any>
    value: number | string | boolean
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
            {(value === '' || value == null) && (
                <Errors inline>This field cannot be empty</Errors>
            )}
        </span>
    )
}

export default Literal
