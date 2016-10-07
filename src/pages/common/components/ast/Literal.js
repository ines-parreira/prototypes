import React from 'react'
import Widget from './Widget'

/*
 interface Literal <: Node, Expression {
 type: "Literal";
 value: string | boolean | null | number | RegExp;
}
 */
const Literal = ({ value, index, actions, parent, leftsiblings, schemas }) => {
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

Literal.propTypes = {
    actions: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    leftsiblings: React.PropTypes.object.isRequired,
    parent: React.PropTypes.object.isRequired,
    schemas: React.PropTypes.object.isRequired,
    value: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.bool]).isRequired,
}

export default Literal
