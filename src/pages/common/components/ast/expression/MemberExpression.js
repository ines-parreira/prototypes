import React from 'react'

import { upperFirst } from 'lodash'

import Expression from '../expression/Expression'

import getSyntaxTreeLeaves from '../utils'

/*
 interface MemberExpression <: Expression, Pattern {
 type: "MemberExpression";
 object: Expression;
 property: Expression;
 computed: boolean;
}
 */
const MemberExpression = ({ object, property, index, actions, parent, leftsiblings, schemas }) => {
    let left
    if (leftsiblings) {
        left = leftsiblings.push(...getSyntaxTreeLeaves(object))
        // we need to title the first object after the definition definitions, ticket => definitions, Ticket
        // this is needed to match the swagger spec structure
        left = left.set(1, upperFirst(left.get(1)))
        // each object in the swagger spec has properties
        if (left.get(2) !== 'properties') {
            left = left.splice(2, 0, 'properties')
        }
    }

    return (
        <span className="MemberExpression">
            <Expression
                {...object}
                parent={parent.push('object')}
                index={index}
                actions={actions}
                schemas={schemas}
                leftsiblings={leftsiblings}
            />
            <Expression
                {...property}
                parent={parent.push('property')}
                index={index}
                actions={actions}
                leftsiblings={left}
                schemas={schemas}
            />
        </span>
    )
}

MemberExpression.propTypes = {
    actions: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    leftsiblings: React.PropTypes.object.isRequired,
    object: React.PropTypes.object.isRequired,
    parent: React.PropTypes.object.isRequired,
    property: React.PropTypes.object.isRequired,
    schemas: React.PropTypes.object.isRequired,
    type: React.PropTypes.string,
}

export default MemberExpression
