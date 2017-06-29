import React from 'react'
import Expression from '../expression/Expression'

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
const MemberExpression = ({object, property, rule, actions, parent, leftsiblings, schemas}) => {
    let left
    if (leftsiblings) {
        left = leftsiblings.concat(getSyntaxTreeLeaves(object))
        // We need to match the object definision ticket => definitions, Ticket
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
        <span className="MemberExpression">
            <Expression
                {...object}
                parent={parent.push('object')}
                rule={rule}
                actions={actions}
                schemas={schemas}
                leftsiblings={leftsiblings}
            />
            <Expression
                {...property}
                parent={parent.push('property')}
                rule={rule}
                actions={actions}
                leftsiblings={left}
                schemas={schemas}
            />
        </span>
    )
}

MemberExpression.propTypes = {
    rule: React.PropTypes.object.isRequired,
    actions: React.PropTypes.object.isRequired,
    leftsiblings: React.PropTypes.object.isRequired,
    object: React.PropTypes.object.isRequired,
    parent: React.PropTypes.object.isRequired,
    property: React.PropTypes.object.isRequired,
    schemas: React.PropTypes.object.isRequired,
    type: React.PropTypes.string,
}

export default MemberExpression
