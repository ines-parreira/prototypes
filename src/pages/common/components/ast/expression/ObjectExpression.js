import React from 'react'

import Property from '../Property'

/* interface ObjectExpression <: Expression {
 type: "ObjectExpression";
 properties: [ Property ];
}
 */
const ObjectExpression = ({ properties, leftsiblings, parent, actions, index, schemas }) => {
    const propertiesComp = properties.map((property, idx) => {
        let leftsiblings2
        if (leftsiblings !== undefined) {
            leftsiblings2 = leftsiblings.push(property.key.name)
        }

        const parentProperty = parent.push('properties', idx)
        return (
            <Property
                {...property}
                key={idx}
                theKey={property.key}
                leftsiblings={leftsiblings2}
                parent={parentProperty}
                actions={actions}
                schemas={schemas}
                index={index}
            />
        )
    })

    return (
        <form className="ui form">{propertiesComp}</form>
    )
}

ObjectExpression.propTypes = {
    actions: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    leftsiblings: React.PropTypes.object.isRequired,
    parent: React.PropTypes.object.isRequired,
    properties: React.PropTypes.array.isRequired,
    schemas: React.PropTypes.object.isRequired,
}

export default ObjectExpression
