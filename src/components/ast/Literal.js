import React, {PropTypes} from 'react'
import Widget from './Widget'

/*
 interface Literal <: Node, Expression {
 type: "Literal";
 value: string | boolean | null | number | RegExp;
 }
 */
export default class Literal extends React.Component {
    render() {
        const { type, value, index, actions, parent, leftsiblings, schemas } = this.props
        const parentNew = parent.push('value')

        return (
            <span className="Literal">
                <Widget
                    value={value}
                    parent={parentNew}
                    index={index}
                    actions={actions}
                    schemas={schemas}
                    leftsiblings={leftsiblings}
                />
            </span>
        )
    }
}

Literal.propTypes = {
    type: PropTypes.string
}
