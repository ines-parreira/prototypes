// @flow
import React from 'react'

import Errors from '../Errors'
import Widget from '../Widget'

type Props = {
    actions: Object,
    elements: Array<*>,
    leftsiblings: Object,
    parent: Object,
    rule: Object,
    schemas: Object,
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
