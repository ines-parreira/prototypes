import React, { PropTypes } from 'react'
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
    actions: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    leftsiblings: PropTypes.object.isRequired,
    parent: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
}

export default Literal
