import React, { PropTypes } from 'react'
import Expression from '../expression/Expression'
import { upperFirst } from 'lodash'

import getSyntaxTreeLeaves from '../utils'

/*
 interface MemberExpression <: Expression, Pattern {
 type: "MemberExpression";
 object: Expression;
 property: Expression;
 computed: boolean;
 }
 */
export default class MemberExpression extends React.Component {
    handleChange(event) {
        const { actions, index, parent } = this.props
        actions.modifyCodeast(index, parent, event.target.value)
    }

    render() {
        const { type, object, property, computed, index, actions, parent, leftsiblings, schemas } = this.props

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
                    { ...object }
                    parent={parent.push('object')}
                    index={index}
                    actions={actions}
                    schemas={schemas}
                    leftsiblings={ leftsiblings }
                />
                <Expression
                    { ...property }
                    parent={parent.push('property')}
                    index={index}
                    actions={actions}
                    leftsiblings={ left }
                    schemas={schemas}
                />
            </span>
        )
    }
}

MemberExpression.propTypes = {
    type: PropTypes.string
}
