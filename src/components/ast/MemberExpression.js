import React, {PropTypes} from 'react'
import Expression from './Expression'

import getSyntaxTreeLeaves from './utils'

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
        const {actions, index, parent } = this.props
        actions.modifyCodeast(index, parent, event.target.value)
    }

    render() {
        const { type, object, property, computed, index, actions, parent, leftsiblings } = this.props

        const parentObject = parent.push('object')
        const parentProperty = parent.push('property')

        let leftsiblings2
        if (leftsiblings) {
            leftsiblings2 = leftsiblings.push(...getSyntaxTreeLeaves(object))
        }

        return (
            <span className="MemberExpression">
                <Expression { ...object } parent={parentObject} index={index} actions={actions}
                                          leftsiblings={ leftsiblings }/>
                <Expression { ...property } parent={parentProperty} index={index} actions={actions}
                                            leftsiblings={ leftsiblings2 }/>
            </span>
        )
    }
}

MemberExpression.propTypes = {
    type: PropTypes.string
}
