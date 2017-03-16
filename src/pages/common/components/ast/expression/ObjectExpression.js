import React from 'react'

import Property from '../Property'

/* The ObjectExpression is usually reserved for actions.

 Example:

 Action('notify', {
 subject: "1234"
 })

 */
const ObjectExpression = ({properties, leftsiblings, parent, actions, rule, schemas, config}) => {
    const propertiesComp = properties.map((property, idx) => {
        let leftsiblings2
        if (leftsiblings !== undefined) {
            leftsiblings2 = leftsiblings.push(property.key.name)
        }

        const parentProperty = parent.push('properties', idx)
        const argConfig = config ? config[property.key.name] : undefined
        return (
            <Property
                {...property}
                key={idx}
                theKey={property.key}
                leftsiblings={leftsiblings2}
                parent={parentProperty}
                actions={actions}
                schemas={schemas}
                config={argConfig}
                rule={rule}
            />
        )
    })

    return (
        <div className="ui form">{propertiesComp}</div>
    )
}

ObjectExpression.propTypes = {
    actions: React.PropTypes.object.isRequired,
    rule: React.PropTypes.object.isRequired,
    leftsiblings: React.PropTypes.object.isRequired,
    parent: React.PropTypes.object.isRequired,
    properties: React.PropTypes.array.isRequired,
    schemas: React.PropTypes.object.isRequired,
    config: React.PropTypes.object,
}

export default ObjectExpression
