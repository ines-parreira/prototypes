import {List, Map} from 'immutable'
import React from 'react'

import {RuleItemActions} from 'pages/settings/rules/types'

import Errors from '../Errors'
import Widget from '../Widget'

type Props = {
    actions: RuleItemActions
    elements: {value?: Maybe<string>}[]
    leftsiblings: List<any>
    parent: List<any>
    rule: Map<any, any>
    schemas: Map<any, any>
}

export default function ArrayExpression({
    actions,
    elements,
    leftsiblings,
    parent,
    rule,
    schemas,
}: Props) {
    const parentNew = parent.push('elements')
    const value = elements
        .filter((elem) => ![undefined, null, ''].includes(elem.value))
        .map((elem) => elem.value)

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
            {value.length === 0 && (
                <Errors inline>This field cannot be empty</Errors>
            )}
        </span>
    )
}
