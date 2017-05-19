import React, { PropTypes } from 'react'
import Widget from './Widget'
import ErrorMessage from '../../../common/components/ErrorMessage'

/*
 interface Literal <: Node, Expression {
 type: "Literal";
 value: string | boolean | null | number | RegExp;
}
 */
const Literal = ({ value, rule, actions, parent, leftsiblings, schemas }) => {
    const parentNew = parent.push('value')

    return (
        <span className="Literal">
            <Widget
                value={value}
                parent={parentNew}
                rule={rule}
                actions={actions}
                schemas={schemas}
                leftsiblings={leftsiblings}
            />
            {value === '' && (
                <ErrorMessage
                    key="errors"
                    className="m0i ml15i p5i"
                    errors={'This field cannot be empty'}
                    inline
                />
            )}
        </span>
    )
}

Literal.propTypes = {
    rule: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    leftsiblings: PropTypes.object.isRequired,
    parent: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
}

export default Literal
