import React, {Component, PropTypes} from 'react'

import Errors from '../Errors'
import Widget from '../Widget'

export default class ArrayExpression extends Component {
    static propTypes = {
        actions: PropTypes.object.isRequired,
        elements: PropTypes.array.isRequired,
        leftsiblings: PropTypes.object.isRequired,
        parent: PropTypes.object.isRequired,
        rule: PropTypes.object.isRequired,
        schemas: PropTypes.object.isRequired,
    }

    render() {
        const {actions, elements, leftsiblings, parent, rule, schemas} = this.props
        const parentNew = parent.push('elements')
        const value = elements.filter(elem => ![undefined, null, ''].includes(elem.value)).map(elem => elem.value)

        return (
            <span className="Literal">
                <Widget
                    value={value}
                    parent={parentNew}
                    rule={rule}
                    actions={actions}
                    schemas={schemas}
                    leftsiblings={leftsiblings}
                    compact
                />
                {value.length === 0 && (
                    <Errors inline>This field cannot be empty</Errors>
                )}
            </span>
        )
    }
}
