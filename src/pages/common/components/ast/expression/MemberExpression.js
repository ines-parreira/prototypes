import React from 'react'
import PropTypes from 'prop-types'

import Expression from '../expression/Expression.tsx'

import {getSyntaxTreeLeaves} from '../utils'
import {OBJECT_DEFINITIONS} from '../../../../../state/rules/constants'

/*
 interface MemberExpression <: Expression, Pattern {
 type: "MemberExpression";
 object: Expression;
 property: Expression;
 computed: boolean;
 }
 */
const MemberExpression = ({
    object,
    property,
    rule,
    actions,
    parent,
    leftsiblings,
    schemas,
}) => {
    let left
    if (leftsiblings) {
        left = leftsiblings.concat(getSyntaxTreeLeaves(object))
        // We need to match the object definition ticket => definitions, Ticket
        // this is needed to match the swagger spec structure
        const definition = OBJECT_DEFINITIONS[left.get(1)]
        if (!definition) {
            console.error(`Definition not found for ${left.get(1)}`, left)
        }
        left = left.set(1, definition)
        // each object in the swagger spec has properties
        if (left.get(2) !== 'properties') {
            left = left.splice(2, 0, 'properties')
        }
    }

    return (
        <>
            <Expression
                {...object}
                parent={parent.push('object')}
                rule={rule}
                actions={actions}
                schemas={schemas}
                leftsiblings={leftsiblings}
                className="IdentifierDropdown"
            />
            <Expression
                {...property}
                parent={parent.push('property')}
                rule={rule}
                actions={actions}
                leftsiblings={left}
                schemas={schemas}
                className="IdentifierDropdown"
            />
        </>
    )
}

MemberExpression.propTypes = {
    rule: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    leftsiblings: PropTypes.object.isRequired,
    object: PropTypes.object.isRequired,
    parent: PropTypes.object.isRequired,
    property: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,
    type: PropTypes.string,
}

export default MemberExpression
