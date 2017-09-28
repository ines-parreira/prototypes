import React from 'react'

import Property from '../Property'

/* The ObjectExpression is usually reserved for actions.

 Example:

 Action('notify', {
 subject: "1234"
 })

 */
export default class ObjectExpression extends React.Component {
    static propTypes = {
        leftsiblings: React.PropTypes.object.isRequired,
        parent: React.PropTypes.object.isRequired,
        properties: React.PropTypes.array.isRequired,
        config: React.PropTypes.object,
    }

    render() {
        const {properties, leftsiblings, parent, config} = this.props

        const propertiesComp = properties.map((property, idx) => {
            let leftsiblings2
            if (leftsiblings !== undefined) {
                leftsiblings2 = leftsiblings.push(property.key.name)
            }

            const parentProperty = parent.push('properties', idx)
            const argConfig = config ? config[property.key.name] : undefined

            if (argConfig && argConfig.hide) {
                return null
            }

            return (
                <Property
                    {...this.props}
                    {...property}
                    key={idx}
                    theKey={property.key}
                    leftsiblings={leftsiblings2}
                    parent={parentProperty}
                    config={argConfig}
                />
            )
        })

        return (
            <div>{propertiesComp}</div>
        )
    }
}
