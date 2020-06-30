// @flow
import React from 'react'
import _pick from 'lodash/pick'

import Property from '../Property'

/* The ObjectExpression is usually reserved for actions.

 Example:

 Action('notify', {
 subject: "1234"
 })

 */
type Props = {
    leftsiblings: Object,
    parent: Object,
    properties: Array<*>,
    config: Object,
    rule: Object,
    schemas: Object,
    actions: Object,
    className?: string,
    compact?: boolean,
}

export default class ObjectExpression extends React.Component<Props> {
    render() {
        const {properties, leftsiblings, parent, config} = this.props

        const propertiesComp = properties.map((property, idx) => {
            let leftsiblings2
            if (leftsiblings !== undefined) {
                leftsiblings2 = leftsiblings.push(property.key.name)
            }

            const parentProperty = parent.push('properties', idx)
            const argConfig =
                config && config.args ? config.args[property.key.name] : {}

            if (argConfig && argConfig.hide) {
                return null
            }

            const propsToPass = _pick(this.props, [
                'compact',
                'className',
                'actions',
                'schemas',
                'rule',
                'properties',
            ])

            return (
                <Property
                    {...propsToPass}
                    key={idx}
                    value={property.value}
                    theKey={property.key}
                    leftsiblings={leftsiblings2}
                    parent={parentProperty}
                    config={argConfig}
                />
            )
        })

        return <div>{propertiesComp}</div>
    }
}
