import React from 'react'
import {List, Map} from 'immutable'

import Errors from '../Errors.js'
import Widget from '../Widget.js'

import {RuleItemActions} from '../../../../settings/rules/detail/components/RuleItem/RuleItem'

type Props = {
    actions: RuleItemActions
    elements: {value?: Maybe<string>}[]
    leftsiblings: List<any>
    parent: List<any>
    rule: Map<any, any>
    schemas: Map<any, any>
}

export default class ArrayExpression extends React.Component<Props> {
    render() {
        const {
            actions,
            elements,
            leftsiblings,
            parent,
            rule,
            schemas,
        } = this.props
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
}
